import { Request, Response } from 'express';
import { z } from 'zod';
import * as service from './tts.service';
import { AppError } from '../../utils/AppError';

const TTSRequestSchema = z.object({
  text: z.string().min(1).max(5000),
});

export const generate = async (req: Request, res: Response): Promise<void> => {
  const parsed = TTSRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError('text field is required (max 5000 chars)', 400);

  if (!req.user) throw new AppError('Authentication required', 401);
  const audioUrl = await service.generateTTSAudio(parsed.data.text, req.user.id);
  res.json({ status: 'success', data: { audioUrl } });
};
