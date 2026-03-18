import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../user/user.model';
import { AuctionItem } from '../auction/auction.model';

@Table({ tableName: 'bids', timestamps: true, updatedAt: false })
export class Bid extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare amount: number;

  @ForeignKey(() => AuctionItem)
  @Column({ type: DataType.UUID, allowNull: false })
  declare auctionId: string;

  @BelongsTo(() => AuctionItem)
  auction: AuctionItem;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @BelongsTo(() => User)
  user: User;
}
