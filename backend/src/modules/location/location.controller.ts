import { Controller, Get, Query } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.locationService.search(q);
  }

  @Get('reverse')
  async reverse(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.locationService.reverse(parseFloat(lat), parseFloat(lng));
  }
}
