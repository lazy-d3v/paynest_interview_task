import { Module, Global } from '@nestjs/common';
import { AuctionGateway } from './auction.gateway';

@Global()
@Module({
  providers: [AuctionGateway],
  exports: [AuctionGateway],
})
export class GatewayModule {}
