import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../user/user.model';
import { Bid } from '../bid/bid.model';

export enum AuctionStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
}

@Table({
  tableName: 'auction_items',
  timestamps: true,
  version: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['endTime'] },
    { fields: ['status', 'endTime'] },
  ],
})
export class AuctionItem extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  declare startingPrice: number;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  declare currentHighestBid: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare currentHighestBidderId: number;

  @BelongsTo(() => User, 'currentHighestBidderId')
  currentHighestBidder: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare createdByUserId: number;

  @BelongsTo(() => User, 'createdByUserId')
  createdByUser: User;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare duration: number; // in seconds

  @Column({ type: DataType.DATE, allowNull: false })
  declare startTime: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare endTime: Date;

  @Column({
    type: DataType.ENUM(...Object.values(AuctionStatus)),
    defaultValue: AuctionStatus.ACTIVE,
  })
  declare status: AuctionStatus;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  declare imageUrls: string[];

  @HasMany(() => Bid)
  bids: Bid[];
}
