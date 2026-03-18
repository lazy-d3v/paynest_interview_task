import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AuctionItem, AuctionStatus } from './auction.model';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { User } from '../user/user.model';

@Injectable()
export class AuctionService {
  constructor(
    @InjectModel(AuctionItem)
    private readonly auctionModel: typeof AuctionItem,
  ) {}

  async findAll(): Promise<AuctionItem[]> {
    return this.auctionModel.findAll({
      include: [
        { model: User, as: 'currentHighestBidder' },
        { model: User, as: 'createdByUser' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string): Promise<AuctionItem> {
    const auction = await this.auctionModel.findByPk(id, {
      include: [
        { model: User, as: 'currentHighestBidder' },
        { model: User, as: 'createdByUser' },
      ],
    });
    if (!auction) {
      throw new NotFoundException(`Auction with ID "${id}" not found`);
    }
    return auction;
  }

  async create(dto: CreateAuctionDto, userId: number): Promise<AuctionItem> {
    const now = new Date();
    const endTime = new Date(now.getTime() + dto.duration * 1000);

    const auction = await this.auctionModel.create({
      name: dto.name,
      description: dto.description || '',
      startingPrice: dto.startingPrice,
      duration: dto.duration,
      startTime: now,
      endTime,
      status: AuctionStatus.ACTIVE,
      imageUrls: dto.imageUrls || [],
      createdByUserId: userId,
    });

    // Reload with associations
    return this.findById(auction.id);
  }

  async update(
    id: string,
    dto: Partial<CreateAuctionDto>,
    userId: number,
  ): Promise<AuctionItem> {
    const auction = await this.findById(id);

    if (auction.createdByUserId !== userId) {
      throw new ForbiddenException(
        'Only the auction creator can edit this auction',
      );
    }

    if (auction.status === AuctionStatus.ENDED) {
      throw new BadRequestException('Cannot edit an ended auction');
    }

    const updateData: Partial<AuctionItem> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.imageUrls !== undefined) updateData.imageUrls = dto.imageUrls;

    // If duration changes, recalculate endTime
    if (dto.duration !== undefined) {
      updateData.duration = dto.duration;
      updateData.endTime = new Date(
        auction.startTime.getTime() + dto.duration * 1000,
      );
    }

    await auction.update(updateData);
    return this.findById(id);
  }

  async delete(id: string, userId: number): Promise<void> {
    const auction = await this.findById(id);

    if (auction.createdByUserId !== userId) {
      throw new ForbiddenException(
        'Only the auction creator can delete this auction',
      );
    }

    await auction.destroy();
  }

  async findExpiredActive(): Promise<AuctionItem[]> {
    return this.auctionModel.findAll({
      where: {
        status: AuctionStatus.ACTIVE,
        endTime: {
          [Op.lt]: new Date(),
        },
      },
    });
  }

  async markAsEnded(id: string): Promise<void> {
    await this.auctionModel.update(
      { status: AuctionStatus.ENDED },
      { where: { id } },
    );
  }
}
