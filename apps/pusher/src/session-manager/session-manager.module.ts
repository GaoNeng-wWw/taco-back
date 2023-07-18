import { Module } from '@nestjs/common';
import { SessionManagerService } from './session-manager.service';

@Module({
	providers: [SessionManagerService],
	imports: [],
})
export class SessionManagerModule {}
