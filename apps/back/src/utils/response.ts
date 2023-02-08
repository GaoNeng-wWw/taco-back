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
}

export enum State {
  SUCCESS = '00',
  FAIL = '01',
  FAIL_TOKEN_EXPIRED = '02',
  FAIL_SERVER_ERROR = '03',
  FAIL_BAD_REQUEST = '04',
  FAIL_NOT_FRIEND = '05',
  FAIL_NOT_IN_GROUP = '06',
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

export type ApiResponseType<D = Record<string, any>> = {
  protocol: Protocol;
  state: State;
  layer: Layer;
  action: userAction | friendAction | groupAction | chatKind;
  code: `${ApiResponseType['protocol']}${ApiResponseType['layer']}${ApiResponseType['action']}`;
  message: string;
  data: D;
};

export class ApiResponse<
  T extends userAction | friendAction | groupAction | chatKind,
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
  private action: userAction | friendAction | groupAction | chatKind;
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
    this.data = data ?? {};
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
      protocol: this.protocol,
      state: this.state,
      layer: this.layer,
      action: this.action,
      code: this.code,
      message,
      data: this.data as D,
    };
  }
  updateMessage(message: string) {
    this.message = message;
  }
  setData(data: Record<string, any>) {
    this.data = data;
  }
}
