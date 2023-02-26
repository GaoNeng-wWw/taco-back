export type NoticeLevel =
  | 'dot'
  | 'tips'
  | 'session-tips'
  | 'prevent'
  | 'alert'
  | 'modal';
export type NoticeScope = 'system' | 'friend' | 'group';
export type SystemAction = 'force-login-out';
export type FriendAction =
  | 'new-friend'
  | 'add-request'
  | 'accept'
  | 'refuse'
  | 'toBlackList'
  | 'delete-request';
export type GroupAction =
  | 'add-request'
  | 'invite-request'
  | 'new-member'
  | 'accept'
  | 'refuse'
  | 'kick'
  | 'estopple'
  | 'update-manager'
  | 'change-master'
  | 'new-group-notice'
  | 'all-estopple';
export type Action<scope extends NoticeScope> = scope extends 'friend'
  ? FriendAction
  : scope extends 'group'
  ? GroupAction
  : SystemAction;
type mayNeedReason<scope> = scope extends 'friend' | 'group' ? true : false;
export type isRequest<action> = action extends `${infer R}-request`
  ? true
  : false;
export abstract class INoticePayload<
  scope extends NoticeScope,
  A = Action<scope>,
> {
  nid?: string;
  scope: scope;
  action: A;
  source: string;
  target: string;
  reason: mayNeedReason<scope> extends true ? string : never;
  message: isRequest<A> extends true ? string : never;
}
export interface INotice<S extends NoticeScope, A extends Action<NoticeScope>> {
  setScope(scope: S): this;
  setLevel(level: NoticeLevel): this;
  setSource(source: string): this;
  setTarget(target: string): this;
  setAction(action: A): this;
  setMessage(message: string): this;
  setReason(reason: mayNeedReason<S> extends true ? string : never): this;
  getPayload(): INoticePayload<S, A>;
}
