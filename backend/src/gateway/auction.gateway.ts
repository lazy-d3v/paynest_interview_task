import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'auction',
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AuctionGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinAuction')
  async handleJoinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() auctionId: string,
  ) {
    await client.join(`auction-${auctionId}`);
    this.logger.log(`Client ${client.id} joined auction room: ${auctionId}`);
    return { event: 'joinedAuction', data: auctionId };
  }

  @SubscribeMessage('leaveAuction')
  async handleLeaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() auctionId: string,
  ) {
    await client.leave(`auction-${auctionId}`);
    this.logger.log(`Client ${client.id} left auction room: ${auctionId}`);
    return { event: 'leftAuction', data: auctionId };
  }

  // Called by BidService / AuctionExpirationService
  broadcastNewBid(auctionId: string, bidData: any) {
    this.server.to(`auction-${auctionId}`).emit('newBid', bidData);
    this.logger.log(`Broadcasted newBid to auction room: ${auctionId}`);
  }

  broadcastAuctionEnded(auctionId: string, auctionData: any) {
    this.server.to(`auction-${auctionId}`).emit('auctionEnded', auctionData);
    this.logger.log(`Broadcasted auctionEnded to room: ${auctionId}`);
  }

  broadcastAuctionCreated(auctionData: any) {
    this.server.emit('auctionCreated', auctionData);
    this.logger.log('Broadcasted auctionCreated to all clients');
  }
}
