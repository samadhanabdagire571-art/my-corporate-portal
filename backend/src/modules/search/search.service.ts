import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SearchService {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
  ) {}

  async search(query: string) {
    return this.db.globalSearch(query);
  }
}
