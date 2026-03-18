import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async count(): Promise<number> {
    return this.userModel.count();
  }

  async create(user: Partial<User>): Promise<User> {
    return this.userModel.create(user);
  }

  async bulkCreate(users: Partial<User>[]): Promise<User[]> {
    return this.userModel.bulkCreate(users);
  }
}
