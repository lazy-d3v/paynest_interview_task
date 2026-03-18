import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Bid } from './bid.model';
import { AuctionItem, AuctionStatus } from '../auction/auction.model';
import { User } from '../user/user.model';

@Injectable()
export class BidService {
  private readonly logger = new Logger(BidService.name);

  constructor(
    @InjectModel(Bid)
    private readonly bidModel: typeof Bid,
    @InjectModel(AuctionItem)
    private readonly auctionModel: typeof AuctionItem,
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly sequelize: Sequelize,
  ) {}

  async findByAuctionId(auctionId: string): Promise<Bid[]> {
    return this.bidModel.findAll({
      where: { auctionId },
      include: [{ model: User }],
      order: [['createdAt', 'DESC']],
    });
  }

  async placeBid(
    auctionId: string,
    amount: number,
    userId: number,
  ): Promise<{ bid: Bid; auction: AuctionItem }> {
    // Validate user exists
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    const transaction = await this.sequelize.transaction();

    try {
      const auction = await this.auctionModel.findByPk(auctionId, {
        include: [{ model: User, as: 'currentHighestBidder' }],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!auction) {
        throw new NotFoundException(`Auction with ID "${auctionId}" not found`);
      }

      // Owner cannot bid on their own auction
      if (auction.createdByUserId === userId) {
        throw new ForbiddenException('You cannot bid on your own auction');
      }

      // Validate auction status
      if (auction.status === AuctionStatus.ENDED) {
        throw new BadRequestException('This auction has already ended');
      }

      if (new Date() > auction.endTime) {
        throw new BadRequestException('This auction has expired');
      }

      // Validate bid amount
      const minimumBid = auction.currentHighestBid
        ? Number(auction.currentHighestBid)
        : Number(auction.startingPrice);

      if (amount <= minimumBid) {
        throw new BadRequestException(
          `Bid must be higher than $${minimumBid}. You bid $${amount}`,
        );
      }

      // Prevent self-outbidding
      if (auction.currentHighestBidderId === userId) {
        throw new BadRequestException('You are already the highest bidder');
      }

      // Create bid
      const bid = await this.bidModel.create(
        {
          amount,
          userId,
          auctionId,
        },
        { transaction },
      );

      // Update auction (Optimistic locking via version: true in model)
      await auction.update(
        {
          currentHighestBid: amount,
          currentHighestBidderId: userId,
        },
        { transaction },
      );

      await transaction.commit();

      // Reload for response
      const updatedBid = await this.bidModel.findByPk(bid.id, {
        include: [{ model: User }],
      });
      const updatedAuction = await this.auctionModel.findByPk(auctionId, {
        include: [
          { model: User, as: 'currentHighestBidder' },
          { model: User, as: 'createdByUser' },
        ],
      });

      this.logger.log(
        `Bid placed: $${amount} by user ${userId} on auction ${auctionId}`,
      );

      return { bid: updatedBid!, auction: updatedAuction! };
    } catch (error: unknown) {
      await transaction.rollback();

      if (
        error &&
        typeof error === 'object' &&
        'name' in error &&
        error.name === 'SequelizeOptimisticLockError'
      ) {
        throw new ConflictException(
          'Another bid was placed at the same time. Please try again.',
        );
      }

      throw error;
    }
  }
}
