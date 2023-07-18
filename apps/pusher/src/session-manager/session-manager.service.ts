import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SessionManagerService {
	private sessions: Map<string, Socket>;
	set(tid: string, client: Socket) {
		this.sessions.set(tid, client);
		return true;
	}
	get(tid: string) {
		return this.sessions.get(tid);
	}
	del(tid: string) {
		return this.sessions.delete(tid);
	}
}
