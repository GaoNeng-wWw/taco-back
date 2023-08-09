import { Inject, Injectable } from '@nestjs/common';
import { ConfigTemplate } from './config.interface';
import { CONFIG_OPTION } from './constance';
import { parse } from 'toml';

@Injectable()
export class ConfigService {
	private config: any;
	constructor(@Inject(CONFIG_OPTION) private readonly configOption: any) {
		this.config = parse(this.configOption);
	}
	get<T>(key: ConfigTemplate): T {
		const path = key.split('.');
		let tmp = this.config;
		while (path.length) {
			const key = path.shift();
			tmp = tmp?.[key];
			if (!tmp) {
				return null;
			}
		}
		return tmp as T;
	}
}
