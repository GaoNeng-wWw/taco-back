import { of } from 'rxjs';
import { HttpResponseInterceptor } from '../src/http-response.interceptor';
import { ApiResponse } from '@app/api-response';
describe('http-response-interceptor', () => {
	let interceptor: HttpResponseInterceptor;

	beforeEach(() => {
		interceptor = new HttpResponseInterceptor();
	});

	it('should be define', () => {
		expect(interceptor).toBeDefined();
	});
	it('object', (done) => {
		const data = {
			foo: 'bar',
		};
		const ob = interceptor.intercept({} as any, {
			handle: () => {
				return of(data);
			},
		});
		const api = new ApiResponse();
		api.success();
		api.setMessage('SUCCESS');
		api.setData(data);
		ob.subscribe({
			next: (val) => expect(val).toStrictEqual(api.getResponse()),
			complete: () => done(),
		});
	});
});
