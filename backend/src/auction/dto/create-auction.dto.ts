import { IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  startingPrice: number;

  @IsNumber()
  @Min(60, { message: 'Duration must be at least 60 seconds' })
  @Type(() => Number)
  duration: number;

  @IsOptional()
  imageUrls?: string[];
}
