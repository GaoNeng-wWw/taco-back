import { Injectable } from '@nestjs/common';
export enum ApiResponseCodeEnum {
	SUCCESS = 1,
	FAIL = -1,
}
@Injectable()
export class ApiResponse {
	private code = 1;
	private message = 'SUCCESS';
	private data: Record<string, any> = {};
	fail() {
		this.code = ApiResponseCodeEnum.FAIL;
	}
	success() {
		this.code = ApiResponseCodeEnum.SUCCESS;
	}
	setMessage(msg: string) {
		this.message = msg;
	}
	setData(data: Record<string, any>) {
		this.data = data;
	}
	getResponse() {
		return {
			code: this.code,
			message: this.message,
			data: this.data,
		};
	}
}
