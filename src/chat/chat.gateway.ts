/* eslint-disable prettier/prettier */
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      
      const {name, token} = socket.handshake.auth;
      console.log('New client connected', name, token);
      if(!name || !token) {
        socket.disconnect();
        return;
      }
      // add client to the list of connected clients
      this.chatService.onClientConnected({name, id: socket.id});

      //Welcome message
      socket.emit('welcome-mesaage','Welcome to the chat');

      this.server.emit('on-Clients-changed', this.chatService.getClients());

      socket.on('disconnect', () => {
        this.chatService.onClientDisconnected({name, id: socket.id});
        //console.log('Client disconnected', socket.id);
        this.server.emit('on-Clients-changed', this.chatService.getClients());

      });
    });
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const {name} = socket.handshake.auth;
    console.log('New message', message, name);

    if(!message || !name) {
      return;
    }

    this.server.emit('on-message', {
      message, 
      userId: socket.id,
      name,
    });
  }
}
