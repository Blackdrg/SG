import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    return this.searchService.search(query || '');
  }

  @Get('trending')
  async getTrending() {
    return this.searchService.getTrending();
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommended')
  async getRecommended(@Req() req: any) {
    return this.searchService.getRecommended(req.user.userId);
  }
}
