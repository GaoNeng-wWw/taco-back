/* eslint-disable indent */
import { ConfigService } from '@app/config';
import { Action, Request as IRequest, ModuleKeys } from '@app/interface';
import { createHash } from 'crypto';

export class Request<M extends ModuleKeys, A extends Action<M> = Action<M>>
	implements IRequest<M, A>
{
	action: A;
	meta: { [key: string]: any };
	module: M;
	rid: string;
	sender: string;
	expire: number;
	sign: string;
	recive: string;
	constructor(
		action: A,
		sender: string,
		module: M,
		expire: number,
		recive: string,
		meta?: { [key: string]: any },
	) {
		this.action = action;
		this.sender = sender;
		this.module = module;
		this.meta = meta;
		this.expire = expire;
		this.recive = recive;
	}
}
export type extractGenericity<T> = T extends Request<infer U> ? U : unknown;
/**
 * @param autoFormatExpire If is true. expire = new Date().getTime() + expire else expire = expire
 * @returns
 */
export const createRequest = <
	M extends ModuleKeys,
	A extends Action<M> = Action<M>,
>(
	action: A,
	sender: string,
	module: M,
	expire: number,
	recive: string,
	meta?: { [key: string]: any },
	autoFormatExpire = true,
) =>
	new Request<M, A>(
		action,
		sender,
		module,
		autoFormatExpire ? new Date().getTime() + expire : expire,
		recive,
		meta,
	);

export const getModule = <T extends Request<ModuleKeys, Action<ModuleKeys>>>(
	request: T,
): `${extractGenericity<T>}` => request.module as `${extractGenericity<T>}`;

export const getAction = <T extends Request<any>>(
	request: T,
): T extends Request<infer M, infer A> ? `${A}` : unknown =>
	request.action as T extends Request<infer M, infer A> ? `${A}` : unknown;

/**
 * @returns when `request.expire` greater than time will return false else return true
 */
export const isExpired = (
	request: Request<any, any>,
	time = new Date().getTime(),
) => {
	return request.expire < time;
};

export const createRid = (request: Request<any, any>) => {
	const requestHash = createHash('md5')
		.update(JSON.stringify(request))
		.digest('hex')
		.slice(0, 16);
	const workerId = process.env.WORKER_ID ?? 1;
	const { sender, recive } = request;
	return `${sender}-${recive}-${workerId}-${requestHash}`;
};
