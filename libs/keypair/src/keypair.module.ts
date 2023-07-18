import { DynamicModule, Global, Module } from '@nestjs/common';
import { KeyPairService } from './keypair.service';
import {
	GenerateKeyOptions,
	KeyPair,
	PartialConfig,
	SerializedKeyPair,
} from 'openpgp';

export const OPTIONS = 'KeyPairOptions';
export type KeyOptions = (
	| (GenerateKeyOptions & { format?: 'armored' })
	| (GenerateKeyOptions & { format: 'binary' })
	| (GenerateKeyOptions & { format: 'object' })
) & {
	option?: {
		pub: string;
		pri: string;
		passphrase?: string;
		config: {
			pub: PartialConfig;
			pri: PartialConfig;
		};
	};
};
export type GenerateKeyPair<T> = T extends 'armored'
	? Promise<SerializedKeyPair<string> & { revocationCertificate: string }>
	: T extends 'binary'
	? Promise<SerializedKeyPair<Uint8Array> & { revocationCertificate: string }>
	: T extends 'object'
	? Promise<KeyPair & { revocationCertificate: string }>
	: never;

@Module({})
export class KeyPairModule {
	static forRoot(options: GenerateKeyOptions): DynamicModule {
		return {
			module: KeyPairModule,
			providers: [
				{
					provide: OPTIONS,
					useValue: options,
				},
				KeyPairService,
			],
			exports: [KeyPairService],
		};
	}
}
