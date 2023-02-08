import { Injectable } from '@nestjs/common';
import { resolve } from 'path';

@Injectable()
export class ConfigService {
  public static config;
  constructor() {
    ConfigService.config = {
      PORT: '3001',
      BASE_URL: `http://127.0.0.1:3002`,
			PUBLIC: `${resolve('.')}\\public\\`
    };
  }
	get(key:string): any{
		return ConfigService.config[key];
	}
}
