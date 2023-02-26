import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import {
  ApiResponse,
  Layer,
  Protocol,
  State,
  userAction,
} from '@common/utils/response';

@Catch(WsException)
export class WsExceptionFilter<T> extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}
