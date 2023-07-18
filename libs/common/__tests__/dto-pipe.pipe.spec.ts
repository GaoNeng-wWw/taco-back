import { DtoPipe } from '../src/dto-pipe.pipe';
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
describe('DtoPipePipe', () => {
	const service: DtoPipe = new DtoPipe();
	it('should be defined', () => {
		expect(new DtoPipe()).toBeDefined();
	});
	it('transform', () => {
		const newData = service.transform({
			gid: '123123',
		});
		expect(typeof newData['gid']).toBe('bigint');
	});
});
