import { ServiceError, serviceErrorEnum } from '@app/errors';
import { HttpExceptionFilter } from '../src/http-exception.filter';
import { Test } from '@nestjs/testing';
import { ApiResponse } from '@app/api-response';
import { Logger } from '@nestjs/common';
const mockJson = jest.fn();
const mockStatus = jest.fn().mockImplementation(() => ({
	json: mockJson,
}));
const mockGetResponse = jest.fn().mockImplementation(() => ({
	status: mockStatus,
}));
const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
	getResponse: mockGetResponse,
	getRequest: jest.fn(),
}));
const mockArgumentsHost = {
	switchToHttp: mockHttpArgumentsHost,
	getArgByIndex: jest.fn(),
	getArgs: jest.fn(),
	getType: jest.fn(),
	switchToRpc: jest.fn(),
	switchToWs: jest.fn(),
};
describe('HttpExceptionFilter', () => {
	let service: HttpExceptionFilter<ServiceError | Error>;
	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [HttpExceptionFilter],
		}).compile();
		service =
			module.get<HttpExceptionFilter<ServiceError | Error>>(
				HttpExceptionFilter,
			);
	});
	it('should be defined', () => {
		expect(service).toBeDefined();
	});
	it('ServiceError', () => {
		const apiResponse = new ApiResponse();

		const err = new ServiceError('test');
		apiResponse.setMessage(err.message);
		apiResponse.fail();
		apiResponse.setData({});

		service.catch(err, mockArgumentsHost);
		expect(mockJson).toBeCalledWith(apiResponse.getResponse());
	});
	it('Type Error', () => {
		const apiResponse = new ApiResponse();
		const err = new TypeError('test');
		apiResponse.setMessage(serviceErrorEnum.UNKNOWN_ERROR);
		apiResponse.fail();
		apiResponse.setData({});
		service.catch(err, mockArgumentsHost);
		expect(mockJson).toBeCalledWith(apiResponse.getResponse());
	});
});
