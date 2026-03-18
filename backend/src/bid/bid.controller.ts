import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AuctionGateway } from '../gateway/auction.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auctions/:auctionId/bids')
export class BidController {
  constructor(
    private readonly bidService: BidService,
    private readonly auctionGateway: AuctionGateway,
  ) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post()
  @UseGuards(JwtAuthGuard)
  async placeBid(
    @Param('auctionId') auctionId: string,
    @Body() dto: PlaceBidDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    const result = await this.bidService.placeBid(auctionId, dto.amount, userId);

    // Broadcast the new bid to all clients in this auction room
    this.auctionGateway.broadcastNewBid(auctionId, {
      bid: result.bid,
      auction: result.auction,
    });

    return result;
  }

  @Get()
  async findBidsByAuction(@Param('auctionId') auctionId: string) {
    return this.bidService.findByAuctionId(auctionId);
  }
}
