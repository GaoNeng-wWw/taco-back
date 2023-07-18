/**
 * Request
 */
export interface Request<
	M extends ModuleKeys,
	A extends Action<M> = Action<M>,
> {
	action: A;
	meta: { [key: string]: any };
	module: M;
	rid: string;
	sender: string;
	expire: number;
	sign: string;
	recive: string;
}
export enum FriendAction {
	ADD = 'ADD',
}
export enum GroupAction {
	INVITE = 'INVITE',
	JOIN = 'JOIN',
}
export type Action<M extends keyof typeof Module> = M extends 'FRIEND'
	? FriendAction
	: GroupAction;

export enum Module {
	FRIEND = 'FRIEND',
	GROUP = 'GROUP',
}
export type ModuleKeys = keyof typeof Module;
