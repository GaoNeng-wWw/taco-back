import { ApiResponse } from '@app/api-response';
import { ServiceError, serviceErrorEnum } from '@app/errors';
import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
	catch(exception: T, host: ArgumentsHost) {
		const context = host.switchToHttp();
		const res = new ApiResponse();
		let code = 0;
		res.fail();
		if (exception instanceof ServiceError) {
			code = exception.code;
			res.setMessage((exception as unknown as ServiceError).message);
		} else {
			code = HttpStatus.INTERNAL_SERVER_ERROR;
			res.setMessage(serviceErrorEnum.UNKNOWN_ERROR);
			Logger.error((exception as unknown as Error).name);
			Logger.error((exception as unknown as Error).message);
			Logger.error((exception as unknown as Error).stack);
			if (process.env.NODE_ENV !== 'test') {
				Logger.error((exception as unknown as Error).name);
				Logger.error((exception as unknown as Error).message);
				Logger.error((exception as unknown as Error).stack);
			}
		}
		context.getResponse<Response>().status(code).json(res.getResponse());
	}
}
