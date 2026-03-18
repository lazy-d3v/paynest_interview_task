import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuctionItem } from './auction.model';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionExpirationService } from './auction-expiration.service';
import { AuctionImageService } from './auction-image.service';

@Module({
  imports: [SequelizeModule.forFeature([AuctionItem])],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionExpirationService, AuctionImageService],
  exports: [AuctionService, AuctionImageService],
})
export class AuctionModule {}
