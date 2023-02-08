import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { writeFile, writeFileSync } from 'fs';
import { ConfigService } from './config/config.service';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
	constructor(private readonly config:ConfigService){}
  uploadAvatar(file) {
    const { mimetype, size, buffer } = file;
		console.log(mimetype)
    const fileName = crypto
      .createHash('md5')
      .update(`${new Date().getTime()}_${size}_${mimetype}`)
      .digest('hex');
    let extendName = '';
    switch (mimetype) {
      case 'image/jpeg':
        extendName = '.jpg';
        break;
      case 'image/png':
        extendName = '.png';
        break;
      default: {
        return {
          code: 200,
          message: '图片是不支持的格式',
        };
      }
    }
		console.log(fileName);
    writeFile(`${this.config.get('PUBLIC')}${fileName}.${extendName}`,buffer,(err)=>{
			if (err){
				throw new InternalServerErrorException(err);
			}
		});
    return {
      code: 200,
      message: '上传成功',
      data: {
        path: `${this.config.get('BASE_URL')}/static/${fileName}.${extendName}`,
      },
    };
  }
}
