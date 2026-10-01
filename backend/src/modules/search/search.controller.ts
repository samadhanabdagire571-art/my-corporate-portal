import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller(['api/search', 'api/v1/search', 'search'])
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    @Inject(SearchService) private readonly searchService: SearchService,
  ) {}

  @Get()
  async search(@Query('q') q: string) {
    return this.searchService.search(q || '');
  }
}
