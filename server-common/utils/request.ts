import {
  BaseRequest,
  FriendRequestAction,
  GroupRequestAction,
  InviteInfo,
  RequestPayload,
  RequestScope,
} from '@common/interface/request.interface';
import { createHash } from 'crypto';

export class Request<T extends FriendRequestAction | GroupRequestAction>
  implements BaseRequest<T>
{
  private payload: RequestPayload<T> = {
    rid: '',
    sender: '',
    reciver: '',
    scope: 'friend',
    action: undefined,
    inviteInfo: undefined,
    message: '',
  };
  setSender(sender: string): this {
    this.payload['sender'] = sender;
    return this;
  }
  setReciver(reciver: string): this {
    this.payload['reciver'] = reciver;
    return this;
  }
  setScope(scope: RequestScope): this {
    this.payload['scope'] = scope;
    return this;
  }
  setAction(action: T): this {
    this.payload['action'] = action;
    return this;
  }
  setInviteInfo(info: T extends GroupRequestAction ? InviteInfo : never): this {
    this.payload['inviteInfo'] = info;
    return this;
  }
  setMessage(message: string): this {
    this.payload['message'] = message;
    return this;
  }
  getPayload(): RequestPayload<T> {
    const hash = createHash('sha512');
    this.payload['rid'] = hash
      .update(JSON.stringify(this.payload))
      .digest('hex');
    return this.payload;
  }
}
