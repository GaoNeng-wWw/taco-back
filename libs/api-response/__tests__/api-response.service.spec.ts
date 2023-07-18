import { ApiResponse } from '../src/api-response';

describe('ApiResponseService', () => {
	let service: ApiResponse;
	beforeEach(async () => {
		service = new ApiResponse();
	});
	describe('service', () => {
		it('fail', () => {
			service.fail();
			expect(service.getResponse().code).toBe(-1);
		});
		it('success', () => {
			expect(service.getResponse().code).not.toBe(-1);
			service.success();
			expect(service.getResponse().code).toBe(1);
		});
		it('set-message', () => {
			service.setMessage('message');
			expect(service.getResponse().message).toBe('message');
		});
		it('set-data', () => {
			service.setData({ foo: 'bar' });
			expect(service.getResponse().data.foo).toBe('bar');
		});
	});
});
