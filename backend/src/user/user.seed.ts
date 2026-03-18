import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserSeedService.name);

  constructor(private readonly userService: UserService) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.userService.count();
    if (count > 0) {
      this.logger.log(`Users already seeded (${count} found). Skipping.`);
      return;
    }

    const defaultPassword = await bcrypt.hash('password123', 10);
    const mainUserPassword = await bcrypt.hash('password123', 10);

    const seedUsers: Array<{
      username: string;
      email: string;
      password: string;
    }> = [];

    // 1st user
    seedUsers.push({
      username: 'paynest_user',
      email: 'user@paynest.com',
      password: mainUserPassword,
    });

    // 99 more users with faker
    const usedEmails = new Set<string>(['user@paynest.com']);
    const usedUsernames = new Set<string>(['paynest_user']);

    for (let i = 1; i <= 99; i++) {
      let username: string;
      let email: string;

      // Ensure unique username
      do {
        username = faker.internet
          .username({
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
          })
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .slice(0, 20);
      } while (usedUsernames.has(username));
      usedUsernames.add(username);

      // Ensure unique email
      do {
        email = faker.internet.email({ firstName: username }).toLowerCase();
      } while (usedEmails.has(email));
      usedEmails.add(email);

      seedUsers.push({
        username,
        email,
        password: defaultPassword,
      });
    }

    await this.userService.bulkCreate(seedUsers);
    this.logger.log(`✅ Seeded ${seedUsers.length} users.`);
    this.logger.log(`   Sample User: user@paynest.com / password123`);
    this.logger.log(`   Random Users: <faker-email> / password123`);
  }
}
