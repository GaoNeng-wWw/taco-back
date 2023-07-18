import { Inject, Injectable } from '@nestjs/common';
import {
	Key,
	PrivateKey,
	createMessage,
	decrypt,
	decryptKey,
	encrypt,
	generateKey,
	readKey,
	readMessage,
	readPrivateKey,
} from 'openpgp';
import { GenerateKeyPair, KeyOptions, OPTIONS } from '.';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class KeyPairService<T extends 'object' | 'armored' | 'binary'> {
	private keyPair: GenerateKeyPair<T>;
	public pub: Promise<Key>;
	public pri: Promise<PrivateKey>;
	constructor(@Inject(OPTIONS) private readonly options: KeyOptions) {
		if (options.option) {
			const { pub, pri } = this.options.option;
			let armoredKey = readFileSync(pub).toString();
			this.pub = readKey({
				armoredKey: armoredKey,
				config: this.options.option.config?.pub ?? {},
			});
			armoredKey = readFileSync(pri).toString();
			this.pri = readPrivateKey({
				armoredKey,
				config: this.options.option.config?.pri ?? {},
			});
		} else {
			this.keyPair = generateKey(
				this.options as any,
			) as GenerateKeyPair<T>;
			this.pub = this.keyPair.then(({ publicKey }) =>
				readKey({ armoredKey: publicKey }),
			);
			this.pri = this.keyPair.then(({ privateKey }) =>
				readPrivateKey({
					armoredKey: privateKey,
				}).then((key) =>
					decryptKey({
						privateKey: key,
						passphrase: this.options.passphrase,
						config: this.options.config,
					}),
				),
			);
		}
	}
	async encrypt(data: string) {
		const msg = await createMessage({ text: data });
		return encrypt({
			message: msg,
			encryptionKeys: await this.pub,
			signingKeys: await this.pri,
		});
	}
	async decrypt(encryptMessage: string) {
		const msg = await readMessage({
			armoredMessage: encryptMessage,
		});
		const { data, signatures } = await decrypt({
			message: msg,
			decryptionKeys: await this.pri,
			verificationKeys: await this.pub,
		});
		let verified = true;
		try {
			await signatures[0].verified;
		} catch {
			verified = false;
		}
		return {
			msg: data,
			verified,
		};
	}
	async export({
		format,
		path,
	}: {
		format: 'pri' | 'pub' | 'pub pri';
		path: string;
	}) {
		const formats = format.split(' ');
		if (formats.length === 1) {
			const armor =
				formats[0] === 'pri'
					? (await this.pri).armor()
					: (await this.pub).armor();
			writeFileSync(join(path, `key.${formats[0]}`), armor);
			return;
		}
		return formats
			.map((f: 'pri' | 'pub' | 'pub pri') => {
				return {
					[f]: this.export({ format: f, path }),
				};
			})
			.reduce((pre, cur) => {
				return {
					...pre,
					...cur,
				};
			}, {});
	}
}
