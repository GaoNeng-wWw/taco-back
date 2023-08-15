import { Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { DbModule } from '@app/db';
import { ModelDefinitionModule } from '@app/model-definition';
import { JwtModule as JWTModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@app/config';

@Global()
@Module({
	imports: [
		DbModule,
		ModelDefinitionModule,
		JWTModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			async useFactory(config: ConfigService): Promise<JwtModuleOptions> {
				const secret = config.get<string>('global.jwt.secret');
				return {
					secret,
				};
			},
		}),
	],
	providers: [JwtService],
	exports: [JwtService],
})
export class JwtModule {}
