import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AuctionService } from './auction.service';
import { AuctionImageService } from './auction-image.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { AuctionItem } from './auction.model';
import { AuctionGateway } from '../gateway/auction.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('auctions')
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly auctionImageService: AuctionImageService,
    private readonly auctionGateway: AuctionGateway,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 3))
  async create(
    @Body() dto: CreateAuctionDto,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<AuctionItem> {
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.auctionImageService.uploadImage(file, dto.name);
        imageUrls.push(url);
      }
    }

    const auction = await this.auctionService.create({ ...dto, imageUrls }, req.user.id);
    this.auctionGateway.broadcastAuctionCreated(auction);
    return auction;
  }

  @Get()
  async findAll(): Promise<AuctionItem[]> {
    return this.auctionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AuctionItem> {
    return this.auctionService.findById(id);
  }

  @Get('image/:id/:index')
  async getProxyImage(
    @Param('id') id: string,
    @Param('index') index: string,
    @Res() res: Response,
  ) {
    const auction = await this.auctionService.findById(id);
    const imageUrl = auction.imageUrls[parseInt(index, 10)];
    if (!imageUrl) {
      return res.status(404).send('Image not found');
    }

    const streamResponse = await this.auctionImageService.streamImage(imageUrl);
    res.set('Content-Type', streamResponse.headers['content-type']);
    streamResponse.data.pipe(res);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 3))
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAuctionDto>,
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<AuctionItem> {
    let imageUrls: string[] | undefined = undefined;
    if (files && files.length > 0) {
      imageUrls = [];
      for (const file of files) {
        const url = await this.auctionImageService.uploadImage(file, dto.name || 'item');
        imageUrls.push(url);
      }
    }

    return this.auctionService.update(id, { ...dto, imageUrls } as any, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    await this.auctionService.delete(id, req.user.id);
    return { message: 'Auction deleted successfully' };
  }
}
