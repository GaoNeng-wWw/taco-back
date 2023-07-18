import { HttpStatus, Injectable } from '@nestjs/common';

export enum serviceErrorEnum {
	NOT_LOGIN = 'NOT_LOGIN',
	ACTION_REJECT = 'ACTION_REJECT',
	PERMISSION_DENIED = 'PERMISSION_DENIED',
	REQUEST_TIME_OUT = 'REQUEST_TIME_OUT',
	TID_OR_PASSWORD_ERROR = 'TID_OR_PASSWORD_ERROR',
	HAS_SAME_USER = 'HAS_SAME_USER',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	NOT_FIND_USER = 'NOT_FIND_USER',
	ANSWER_ERROR = 'ANSWER_ERROR',
	FAIL_TOKEN_INVALIDATE = 'FAIL_TOKEN_INVALIDATE',
	NOT_FIND_REQUEST = 'NOT_FIND_REQUEST',
	REQUEST_EXPIRED = 'REQUEST_EXPIRED',
	INVALIDATE_PAGE = 'INVALIDATE_PAGE',
	IN_BLACK_LIST = 'IN_BLACK_LIST',
	NOT_IN_BLACK_LIST = 'NOT_IN_BLACK_LIST',
	HAS_FRIEND = 'HAS_FRIEND',
	NOT_HAS_FRIEND = 'NOT_HAS_FRIEND',
}

@Injectable()
export class ServiceError extends Error {
	public service: boolean;
	// HTTP RESPONSE CODE
	public code: HttpStatus = HttpStatus.BAD_REQUEST;
	constructor(
		message: string,
		code: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
	) {
		super(message);
		this.service = true;
		this.name = 'SERVICE_ERROR';
		this.code = code;
	}
}
