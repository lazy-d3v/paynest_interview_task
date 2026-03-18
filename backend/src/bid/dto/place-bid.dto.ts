import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PlaceBidDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount: number;
}
