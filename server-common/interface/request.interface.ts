export type RequestScope = 'friend' | 'group';
export type FriendRequestAction =
  | 'add'
  | 'remove'
  | 'move-in-black-list'
  | 'move-out-black-list';
export type GroupRequestAction = 'join' | 'invite' | 'leave' | 'kick';
export type RequestAction<T extends FriendRequestAction | GroupRequestAction> =
  T;
export type InviteInfo = {
  gid: string;
};
export interface RequestPayload<
  T extends FriendRequestAction | GroupRequestAction,
> {
  rid: string;
  sender: string;
  reciver: string;
  scope: RequestScope;
  action: RequestAction<T>;
  inviteInfo: T extends GroupRequestAction ? InviteInfo : never;
  message: string;
}
export abstract class BaseRequest<
  T extends FriendRequestAction | GroupRequestAction,
> {
  abstract setSender(sender: string): this;
  abstract setReciver(reciver: string): this;
  abstract setScope(scope: RequestScope): this;
  abstract setAction(action: RequestAction<T>): this;
  abstract setInviteInfo(info: InviteInfo): this;
  abstract setMessage(message: string): this;
  abstract getPayload(): RequestPayload<T>;
}
