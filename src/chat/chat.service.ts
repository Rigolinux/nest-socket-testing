import { Injectable } from '@nestjs/common';

interface Client {
  name: string;
  id: string;
}

@Injectable()
export class ChatService {
  private clients: Record<string, Client> = {};

  onClientConnected(client: Client) {
    this.clients[client.id] = client;
  }

  onClientDisconnected(client: Client) {
    delete this.clients[client.id];
  }

  getClients() {
    return Object.values(this.clients);
  }
}
