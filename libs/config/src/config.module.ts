import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { readFileSync } from 'fs';
import { CONFIG_OPTION } from './constance';

@Module({})
export class ConfigModule {
	static forRoot(path: string): DynamicModule {
		const raw = readFileSync(path).toString();
		return {
			module: ConfigModule,
			providers: [
				{
					provide: CONFIG_OPTION,
					useValue: raw,
				},
				ConfigService,
			],
			exports: [ConfigModule, ConfigService],
			global: true,
		};
	}
}
