import { Notice as INotice, SenderType } from '@app/interface';
import mongoose from 'mongoose';
export class Notice implements INotice {
	nid: string;
	sender: string;
	senderType: SenderType;
	meta: { [key: string]: any };
	constructor(
		sender: string,
		sender_type: SenderType,
		meta?: { [key: string]: any },
	) {
		this.sender = sender;
		this.senderType = sender_type;
		this.meta = meta ?? {};
		this.nid = new mongoose.Types.ObjectId().toString('hex');
	}
}
export const createNotice = (
	sender: string,
	sender_type: SenderType,
	meta: { [key: string]: any },
) => new Notice(sender, sender_type, meta);
