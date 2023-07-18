export type PartialFuncReturn<T> = {
	[K in keyof T]?: T[K] extends (...args: infer A) => infer U
		? (...args: A) => PartialFuncReturn<U>
		: T[K];
};
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const mockFactory = <T>(
	clazz: PartialFuncReturn<T>,
	async?: boolean,
) => {
	return <T>Object.getOwnPropertyNames((clazz as any).prototype)
		.filter((name) => name !== 'constructor')
		.reduce((obj, func) => {
			if (async) {
				obj[func] = async () => void 0;
			} else {
				obj[func] = () => void 0;
			}
			return obj;
		}, {});
};
export const dbMock = (value: any) => {
	return {
		new: jest.fn().mockResolvedValue(value),
		constructor: jest.fn().mockRejectedValue(value),
		findOneAndUpdate: {
			lean: jest.fn(),
		},
		insertMany: {
			lean: jest.fn(),
		},
		lean: jest.fn(),
	};
};
