/**
 * Notice
 */
export interface Notice<T = { [key: string]: any }> {
	meta: T;
	/**
	 * notice id
	 */
	nid: string;
	sender: string;
	senderType: SenderType;
}

export enum SenderType {
	FRIEND = 'friend',
	GROUP = 'group',
	SYSTEM = 'system',
}
