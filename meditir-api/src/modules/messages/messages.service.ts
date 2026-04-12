import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { Role } from '../../types/enums';

// Canonicalise a user pair so the same conversation is always keyed the same way.
const canonicalPair = (a: string, b: string): [string, string] => (a < b ? [a, b] : [b, a]);

const ensureSameHospitalUser = async (userId: string, hospitalId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, hospitalId },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError('User not found in this hospital', 404);
  return user;
};

export const getOrCreateConversation = async (
  hospitalId: string,
  selfUserId: string,
  otherUserId: string
) => {
  if (selfUserId === otherUserId) {
    throw new AppError('Cannot start a conversation with yourself', 400);
  }
  await ensureSameHospitalUser(otherUserId, hospitalId);

  const [userAId, userBId] = canonicalPair(selfUserId, otherUserId);

  const existing = await prisma.conversation.findUnique({
    where: { hospitalId_userAId_userBId: { hospitalId, userAId, userBId } },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { hospitalId, userAId, userBId },
  });
};

export const sendMessage = async (args: {
  hospitalId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  attachedPatientId?: string | null;
  attachedSessionId?: string | null;
}) => {
  const content = args.content.trim();
  if (!content) throw new AppError('Message cannot be empty', 400);
  if (content.length > 4000) throw new AppError('Message too long (max 4000 characters)', 400);

  const conversation = await getOrCreateConversation(
    args.hospitalId,
    args.fromUserId,
    args.toUserId
  );

  // Validate optional context attachments belong to this hospital
  if (args.attachedPatientId) {
    const p = await prisma.patient.findFirst({
      where: { id: args.attachedPatientId, hospitalId: args.hospitalId },
      select: { id: true },
    });
    if (!p) throw new AppError('Attached patient not found', 404);
  }
  if (args.attachedSessionId) {
    const s = await prisma.consultationSession.findFirst({
      where: { id: args.attachedSessionId, hospitalId: args.hospitalId },
      select: { id: true },
    });
    if (!s) throw new AppError('Attached session not found', 404);
  }

  const message = await prisma.directMessage.create({
    data: {
      conversationId: conversation.id,
      hospitalId: args.hospitalId,
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      content,
      attachedPatientId: args.attachedPatientId ?? null,
      attachedSessionId: args.attachedSessionId ?? null,
    },
  });

  // Bump conversation lastMessageAt so the list re-sorts
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: message.createdAt },
  });

  return message;
};

export const listConversations = async (hospitalId: string, selfUserId: string) => {
  const conversations = await prisma.conversation.findMany({
    where: { hospitalId, OR: [{ userAId: selfUserId }, { userBId: selfUserId }] },
    orderBy: { lastMessageAt: 'desc' },
  });

  // Enrich: for each conversation, load the other participant's user + role profile
  // (doctor or admin name) and the last message + unread count.
  const enriched = await Promise.all(
    conversations.map(async (c) => {
      const otherUserId = c.userAId === selfUserId ? c.userBId : c.userAId;
      const [other, lastMessage, unreadCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id: otherUserId },
          include: {
            doctor: { select: { firstName: true, lastName: true, specialization: true } },
            adminProfile: { select: { firstName: true, lastName: true } },
          },
        }),
        prisma.directMessage.findFirst({
          where: { conversationId: c.id },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.directMessage.count({
          where: { conversationId: c.id, toUserId: selfUserId, readAt: null },
        }),
      ]);
      if (!other) return null;
      return {
        id: c.id,
        lastMessageAt: c.lastMessageAt,
        otherUser: {
          id: other.id,
          email: other.email,
          role: other.role,
          firstName: other.doctor?.firstName ?? other.adminProfile?.firstName ?? other.email,
          lastName: other.doctor?.lastName ?? other.adminProfile?.lastName ?? '',
          specialization: other.doctor?.specialization ?? null,
        },
        lastMessage,
        unreadCount,
      };
    })
  );

  return enriched.filter((c): c is NonNullable<typeof c> => c !== null);
};

export const listMessages = async (
  conversationId: string,
  hospitalId: string,
  selfUserId: string
) => {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, hospitalId },
  });
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (conversation.userAId !== selfUserId && conversation.userBId !== selfUserId) {
    throw new AppError('You are not a participant in this conversation', 403);
  }

  return prisma.directMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });
};

export const markConversationRead = async (
  conversationId: string,
  hospitalId: string,
  selfUserId: string
) => {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, hospitalId },
  });
  if (!conversation) throw new AppError('Conversation not found', 404);

  await prisma.directMessage.updateMany({
    where: { conversationId, toUserId: selfUserId, readAt: null },
    data: { readAt: new Date() },
  });
};

export const getUnreadCount = async (hospitalId: string, selfUserId: string) => {
  return prisma.directMessage.count({
    where: { hospitalId, toUserId: selfUserId, readAt: null },
  });
};

/**
 * Colleagues = all other doctors and admins in the same hospital the current user
 * can message. Excludes the current user.
 */
export const listColleagues = async (hospitalId: string, selfUserId: string) => {
  const users = await prisma.user.findMany({
    where: {
      hospitalId,
      isActive: true,
      id: { not: selfUserId },
      role: { in: [Role.DOCTOR, Role.HOSPITAL_ADMIN] },
    },
    include: {
      doctor: { select: { firstName: true, lastName: true, specialization: true, avatarUrl: true } },
      adminProfile: { select: { firstName: true, lastName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    firstName: u.doctor?.firstName ?? u.adminProfile?.firstName ?? u.email,
    lastName: u.doctor?.lastName ?? u.adminProfile?.lastName ?? '',
    specialization: u.doctor?.specialization ?? null,
    avatarUrl: u.doctor?.avatarUrl ?? u.adminProfile?.avatarUrl ?? null,
  }));
};
