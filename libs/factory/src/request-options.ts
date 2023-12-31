/* eslint-disable indent */
import { ConfigService } from '@app/config';
import { ConfigTemplate } from '@app/config/config.interface';
import { RequestOptions } from '@golevelup/nestjs-rabbitmq';

export type ICreateRequestOptionParam<T = any> = {
	system: string;
	fn: keyof T;
	configService?: ConfigService;
	payload: Record<string, any>;
};

export type ICreateRequestOptionReturn = {
	exchange: string;
	routingKey: string;
	payload: Record<string, any>;
};

export const createRequestOption = <T>({
	system,
	fn,
	configService,
	payload,
}: ICreateRequestOptionParam<T>): ICreateRequestOptionReturn => {
	return {
		exchange:
			configService.get(
				`${system}.${fn.toString()}.exchange` as ConfigTemplate,
			) ?? configService.get('global.rabbitmq.rpc.exchange'),
		routingKey: configService.get(
			`${system}.${fn.toString()}.routingKey` as ConfigTemplate,
		),
		payload,
	};
};

export enum RPCSystem {
	NOTICE = 'notice',
	REQUEST = 'request',
}
export type RPCValues = `${RPCSystem}`;
export class RequestOption<S extends RPCValues, C, P = any>
	implements RequestOptions
{
	exchange: string;
	routingKey: string;
	correlationId?: string;
	timeout?: number;
	payload?: P;
	headers?: any;
	expiration?: string | number;
	constructor({
		system,
		fn,
		configService,
		payload,
	}: {
		system: S;
		fn: keyof C;
		configService: ConfigService;
		payload: P;
	}) {
		this.exchange =
			configService.get(
				`${system}.${fn.toString()}.exchange` as ConfigTemplate,
			) ?? configService.get('global.rabbitmq.rpc.exchange');
		this.routingKey = configService.get(
			`${system}.${fn.toString()}.routingKey` as ConfigTemplate,
		);
		this.payload = payload;
	}
}
