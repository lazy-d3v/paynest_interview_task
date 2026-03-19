import { Test, TestingModule } from '@nestjs/testing';
import { BidService } from './bid.service';
import { getModelToken } from '@nestjs/sequelize';
import { Bid } from './bid.model';
import { AuctionItem, AuctionStatus } from '../auction/auction.model';
import { User } from '../user/user.model';
import { Sequelize } from 'sequelize-typescript';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('BidService', () => {
  let service: BidService;

  const mockBidModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  const mockAuctionModel = {
    findByPk: jest.fn(),
  };

  const mockUserModel = {
    findByPk: jest.fn(),
  };

  const mockSequelize = {
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn(),
      LOCK: { UPDATE: 'UPDATE' },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidService,
        {
          provide: getModelToken(Bid),
          useValue: mockBidModel,
        },
        {
          provide: getModelToken(AuctionItem),
          useValue: mockAuctionModel,
        },
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: Sequelize,
          useValue: mockSequelize,
        },
      ],
    }).compile();

    service = module.get<BidService>(BidService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('placeBid', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);
      await expect(service.placeBid('auction-id', 100, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user bids on their own auction', async () => {
      mockUserModel.findByPk.mockResolvedValue({ id: 1 });
      mockAuctionModel.findByPk.mockResolvedValue({
        id: 'auction-id',
        createdByUserId: 1, // Same as bidder
        update: jest.fn(),
      });

      await expect(service.placeBid('auction-id', 100, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException for expired auction', async () => {
      mockUserModel.findByPk.mockResolvedValue({ id: 2 });
      mockAuctionModel.findByPk.mockResolvedValue({
        id: 'auction-id',
        createdByUserId: 1,
        status: AuctionStatus.ACTIVE,
        endTime: new Date(Date.now() - 10000), // past
        update: jest.fn(),
      });

      await expect(service.placeBid('auction-id', 100, 2)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should place a bid successfully', async () => {
      mockUserModel.findByPk.mockResolvedValue({ id: 2 });

      const mockAuction = {
        id: 'auction-id',
        createdByUserId: 1,
        status: AuctionStatus.ACTIVE,
        endTime: new Date(Date.now() + 100000), // future
        startingPrice: 50,
        currentHighestBid: 60,
        currentHighestBidderId: 3,
        update: jest.fn(),
      };

      mockBidModel.create.mockResolvedValue({ id: 'bid-id' });
      mockBidModel.findByPk.mockResolvedValue({ id: 'bid-id', amount: 100 });

      mockAuctionModel.findByPk
        .mockResolvedValueOnce(mockAuction) // First call: fetch auction to check rules
        .mockResolvedValueOnce({
          // Second call: reload updated auction
          ...mockAuction,
          currentHighestBid: 100,
          currentHighestBidderId: 2,
        });

      const result = await service.placeBid('auction-id', 100, 2);

      expect(result).toBeDefined();
      expect(result.bid.amount).toBe(100);
      expect(mockBidModel.create).toHaveBeenCalled();
      expect(mockAuction.update).toHaveBeenCalledWith(
        { currentHighestBid: 100, currentHighestBidderId: 2 },
        expect.any(Object),
      );
    });
  });
});
