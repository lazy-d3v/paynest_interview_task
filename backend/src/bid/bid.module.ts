import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bid } from './bid.model';
import { AuctionItem } from '../auction/auction.model';
import { User } from '../user/user.model';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';

@Module({
  imports: [SequelizeModule.forFeature([Bid, AuctionItem, User])],
  controllers: [BidController],
  providers: [BidService],
  exports: [BidService],
})
export class BidModule {}
