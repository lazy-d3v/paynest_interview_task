import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionService } from '../auction/auction.service';
import { AuctionGateway } from '../gateway/auction.gateway';

@Injectable()
export class AuctionExpirationService {
  private readonly logger = new Logger(AuctionExpirationService.name);

  constructor(
    private readonly auctionService: AuctionService,
    private readonly auctionGateway: AuctionGateway,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAuctionExpiration() {
    const expiredAuctions = await this.auctionService.findExpiredActive();

    for (const auction of expiredAuctions) {
      await this.auctionService.markAsEnded(auction.id);

      this.auctionGateway.broadcastAuctionEnded(auction.id, {
        auctionId: auction.id,
        name: auction.name,
        finalBid: auction.currentHighestBid,
        winnerId: auction.currentHighestBidderId,
      });

      this.logger.log(`Auction "${auction.name}" (${auction.id}) has ended.`);
    }

    if (expiredAuctions.length > 0) {
      this.logger.log(`Closed ${expiredAuctions.length} expired auction(s).`);
    }
  }
}
