import { MqttModuleOptions } from '@app/mqtt';
import { IClientOptions } from 'mqtt';

export type RPC = {
	exchange: string;
	queue: string;
	routingKey: string;
};
export interface ConfigOption {
	/** Public Configure */
	global: {
		db: {
			uri: string;
		};
		redis: {
			host: string;
			port: number;
			db: number;
			password: string;
			expired: number;
		};
		jwt: {
			secret: string;
			issuer: string;
			expire: string;
		};
		rabbitmq: {
			uri: string;
			enableControllerDiscovery: boolean;
			rpc: {
				exchange: string;
			};
		};
		mqtt: IClientOptions;
		expire: number;
	};
	/** Http scope */
	http: {
		port: number;
	};
	system: {
		/** Size默认值，如果任何一个子系统下的size为空，那么则用默认值 */
		size: number;
		/** Notice system */
		notice: {
			size: number;
			rpc: {
				exchange: string;
				queue: string;
				routingKey: string;
			};
		};
		request: {
			salt: string;
			size: number;
			expire: number;
			removeRequest: RPC;
			addRequest: RPC;
		};
		friends: {
			size: number;
		};
		pusher: {
			expire: number;
		};
	};
}
type Keys<T> = keyof T;
type Values<T> = T[Keys<T>];
export type ConfigTemplate<
	T = ConfigOption,
	A = {
		[key in keyof T]: T[key];
	},
	B = {
		[key in keyof A]: A[key] extends object
			?
					| `${Extract<key, string>}.${Exclude<
							Extract<keyof A[key], string>,
							keyof any[]
					  >}`
					| (ConfigTemplate<A[key]> extends infer R
							? `${Extract<key, string>}.${Extract<R, string>}`
							: never)
			: key;
	},
> = Exclude<keyof A, keyof any[]> | Values<B>;

export type GetTypeByTemplate<
	K extends string,
	obj = ConfigOption,
> = K extends `${infer L}.${infer R}`
	? L extends keyof obj
		? GetTypeByTemplate<R, obj[L]>
		: never
	: K extends keyof obj
	? obj[K]
	: never;
