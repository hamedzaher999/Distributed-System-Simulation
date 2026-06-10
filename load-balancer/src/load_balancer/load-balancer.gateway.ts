import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
@Injectable()
@WebSocketGateway({ cors: true })
export class LoadBalancerGateway {
  @WebSocketServer()
  server: Server;

  broadcastLog(message: any) {
    this.server.emit('log', message);
  }
  updateUI(event: string, payload: any) {
    this.broadcastLog({
      event,
      ...payload,
    });
  }
}
