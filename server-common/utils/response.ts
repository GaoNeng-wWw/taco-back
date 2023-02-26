import { ApiProperty } from '@nestjs/swagger';

export enum Protocol {
  WS = '001',
  HTTP = '002',
}

export enum Layer {
  USER = '01',
  FRIEND = '02',
  GROUP = '03',
  CHAT = '04',
  SPONSOR = '05',
  NOTICE = '06',
  MIDDLEWARE = '07',
  GUARD = '08',
}

export enum State {
  SUCCESS = 0,
  FAIL = 1,
  FAIL_TOKEN_EXPIRED = 2,
  FAIL_SERVER_ERROR = 3,
  FAIL_BAD_REQUEST = 4,
  FAIL_NOT_FRIEND = 5,
  FAIL_NOT_IN_GROUP = 6,
  FAIL_NOT_ONLINE = 7,
  FAIL_NOT_USER = 8,
  FAIL_IS_FRIEND = 9,
  FAIL_NOT_REQUEST = 10,
  FAIL_TOKEN_INVALIDATE = 11,
  FAIL_HAS_REQUEST = 12,
}

export enum userAction {
  LOGIN = '01001',
  REGISTER = '01002',
  LOGINOUT = '01003',
  GET_USER_INFO = '01004',
  UPDATE_USER_INFO = '01005',
  UPDATE_STATE = '01006',
  AUTH = '01007',
}

export enum friendAction {
  GET_FRIENDS = '02001',
  ADD_FRIEND = '02002',
  REMOVE_FRIEND = '02003',
  ACCEPT_REQ = '02004',
  REFUSE_REQ = '02005',
}

export enum groupAction {
  GET_GROUP_LIST = '03001',
  GET_GROUP_INFO = '03002',
  CREATE_GROUP = '03003',
  DELETE_GROUP = '03004',
  AUTH_ROLE = '03005',
  UPDATE_GROUP_INFO = '03006',
  JOIN_GROUP = '03007',
  LEAVE_GROUP = '03008',
  MANAGE_MEMBER = '03009',
}
export enum chatKind {
  P2P = '04001',
  GROUP = '04002',
}
export enum sponsorKind {
  SUBSCRIPTION_VIP = '05001',
  RENEW_VIP = '05002',
}
export enum noticeAction {
  ACCPT_NOTICE = '06001',
  REFUSE_NOTICE = '06002',
  GET_NOTICE = '06003',
}
export enum middlewareAction {
  TOKEN_WHITELIST_VALIDATE = '07001',
}
export enum guardAction {
  REQUEST_CHECK = '08001',
}

export type ApiResponseType<D = Record<string, any>> = {
  protocol: Protocol;
  state: State;
  layer: Layer;
  action:
    | userAction
    | friendAction
    | groupAction
    | chatKind
    | noticeAction
    | middlewareAction
    | guardAction;
  code: `${ApiResponseType['protocol']}${ApiResponseType['layer']}${ApiResponseType['action']}`;
  message: string;
  data: D;
};

export class ApiResponse<
  T extends
    | userAction
    | friendAction
    | groupAction
    | chatKind
    | noticeAction
    | middlewareAction
    | guardAction,
> {
  @ApiProperty({
    enum: State,
  })
  private state: State;
  @ApiProperty()
  private code: any;
  @ApiProperty()
  private message: string;
  @ApiProperty({
    enum: Layer,
  })
  private layer: Layer;
  @ApiProperty({
    enum: [userAction, friendAction, groupAction, chatKind],
  })
  private action:
    | userAction
    | friendAction
    | groupAction
    | chatKind
    | noticeAction
    | middlewareAction
    | guardAction;
  @ApiProperty({
    enum: Protocol,
  })
  private protocol: Protocol;
  @ApiProperty()
  private data: Record<string, any>;
  constructor(
    protocol: Protocol,
    layer: Layer,
    action: T,
    message?: string,
    data?: Record<string, any>,
  ) {
    this.state = State.SUCCESS;
    this.code = `${protocol}${layer}${action}` as string;
    this.message = message ?? ``;
    this.data = undefined ?? data;
    this.layer = layer;
    this.action = action;
    this.protocol = protocol;
  }
  fail(state?: State) {
    this.state = state ?? State.FAIL;
  }
  getResponse<D = Record<string, any>>(): ApiResponseType<D> {
    const message = State[this.state];
    return {
      statusCode: this.code,
      message,
      data: this.data as D,
    } as any;
  }
  updateMessage(message: string) {
    this.message = message;
  }
  setData(data: Record<string, any>) {
    this.data = data;
  }
}
