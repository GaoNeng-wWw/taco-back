import { createHash } from 'node:crypto';

export function encrypt(message: string): string {
  const hash = createHash('sha256').update(message).digest('hex');
  return hash;
}
