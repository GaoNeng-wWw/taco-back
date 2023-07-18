import { ApiResponse } from '@app/api-response';
import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const api = new ApiResponse();
		api.success();
		api.setMessage('SUCCESS');
		return next.handle().pipe(
			map((value) => {
				api.setData(value);
				return api.getResponse();
			}),
		);
	}
}
