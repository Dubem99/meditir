import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';

const MAX_NOTE_LENGTH = 5000;

export const addNote = async (
  sessionId: string,
  hospitalId: string,
  doctorUserId: string,
  text: string
) => {
  const trimmed = text.trim();
  if (!trimmed) throw new AppError('Note text is required', 400);
  if (trimmed.length > MAX_NOTE_LENGTH) {
    throw new AppError(`Note exceeds ${MAX_NOTE_LENGTH} characters`, 400);
  }

  // Verify the session belongs to this hospital and the user is its doctor.
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    include: { doctor: { select: { userId: true } } },
  });
  if (!session) throw new AppError('Session not found', 404);
  if (session.doctor.userId !== doctorUserId) {
    throw new AppError('Only the session doctor can add notes', 403);
  }

  return prisma.additionalNote.create({
    data: {
      sessionId,
      hospitalId,
      doctorUserId,
      text: trimmed,
    },
  });
};

export const listNotes = async (sessionId: string, hospitalId: string) => {
  const session = await prisma.consultationSession.findFirst({
    where: { id: sessionId, hospitalId },
    select: { id: true },
  });
  if (!session) throw new AppError('Session not found', 404);

  return prisma.additionalNote.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
};

export const deleteNote = async (
  noteId: string,
  hospitalId: string,
  doctorUserId: string
) => {
  const note = await prisma.additionalNote.findFirst({
    where: { id: noteId, hospitalId },
    include: { session: { include: { doctor: { select: { userId: true } } } } },
  });
  if (!note) throw new AppError('Note not found', 404);
  if (note.session.doctor.userId !== doctorUserId) {
    throw new AppError('Only the session doctor can delete this note', 403);
  }
  await prisma.additionalNote.delete({ where: { id: noteId } });
};
