import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { user } from 'src/database/schema';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}
  async findOneWithEmail(email: string) {
    return await this.databaseService.db.query.user.findFirst({
      where: eq(user.email, email),
    });
  }
}
