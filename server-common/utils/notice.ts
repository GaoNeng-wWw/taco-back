import {
  Action,
  INotice,
  INoticePayload,
  isRequest,
  NoticeLevel,
  NoticeScope,
} from '../interface/notice.interface';
import { createHash } from 'crypto';
export class Notice<S extends NoticeScope, A extends Action<S>>
  implements INotice<S, A>
{
  public payload: INoticePayload<S, A> = {
    scope: undefined,
    action: undefined,
    source: '',
    target: '',
    reason: undefined,
    message: undefined,
  };
  setReason(
    reason: (S extends 'friend' | 'group' ? true : false) extends true
      ? string
      : never,
  ): this {
    this.payload['reason'] = reason;
    return this;
  }
  setScope(scope: S): this {
    this.payload.scope = scope;
    return this;
  }
  setLevel(level: NoticeLevel): this {
    this.payload['level'] = level;
    return this;
  }
  setSource(source: string): this {
    this.payload['source'] = source;
    return this;
  }
  setTarget(target: string): this {
    this.payload['target'] = target;
    return this;
  }
  setAction(action: A): this {
    this.payload['action'] = action;
    return this;
  }
  setMessage(message: isRequest<A> extends true ? string : never): this {
    this.payload['message'] = message;
    return this;
  }
  getPayload(): INoticePayload<S, A> {
    const hash = createHash('sha512');
    this.payload.nid = hash.update(JSON.stringify(this.payload)).digest('hex');
    return this.payload;
  }
}
