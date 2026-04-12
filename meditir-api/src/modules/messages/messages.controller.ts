import { Request, Response } from 'express';
import * as service from './messages.service';
import { param, hospitalId } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import { getIO, hospitalRoom, userRoom } from '../../socket';

export const listConversations = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const result = await service.listConversations(hospitalId(req), req.user.id);
  res.json({ status: 'success', data: result });
};

export const listColleagues = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const result = await service.listColleagues(hospitalId(req), req.user.id);
  res.json({ status: 'success', data: result });
};

export const listMessages = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const result = await service.listMessages(
    param(req, 'conversationId'),
    hospitalId(req),
    req.user.id
  );
  res.json({ status: 'success', data: result });
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const { toUserId, content, attachedPatientId, attachedSessionId } = req.body;
  if (!toUserId || typeof toUserId !== 'string') {
    throw new AppError('toUserId is required', 400);
  }

  const message = await service.sendMessage({
    hospitalId: hospitalId(req),
    fromUserId: req.user.id,
    toUserId,
    content,
    attachedPatientId,
    attachedSessionId,
  });

  // Real-time fan-out: push to the recipient's personal room and back to the sender
  // (so their other tabs also update).
  try {
    const io = getIO();
    io.to(userRoom(toUserId)).emit('dm:new', message);
    io.to(userRoom(req.user.id)).emit('dm:sent', message);
  } catch {
    // Socket server may not be initialized in test environments
  }

  res.status(201).json({ status: 'success', data: message });
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  await service.markConversationRead(
    param(req, 'conversationId'),
    hospitalId(req),
    req.user.id
  );

  try {
    const io = getIO();
    io.to(userRoom(req.user.id)).emit('dm:read', { conversationId: param(req, 'conversationId') });
    io.to(hospitalRoom(hospitalId(req))).emit('dm:seen', {
      readerUserId: req.user.id,
      conversationId: param(req, 'conversationId'),
    });
  } catch {
    // Ignore if socket unavailable
  }

  res.json({ status: 'success' });
};

export const unreadCount = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const count = await service.getUnreadCount(hospitalId(req), req.user.id);
  res.json({ status: 'success', data: { count } });
};
