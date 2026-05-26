import {
  Controller,
  Get,
  Query,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import axios from 'axios';
import { redis } from '../../config/redis'; // your existing redis config

@Controller('location')
export class LocationController {
  @Get('search')
  async search(@Query('q') q: string) {
    if (!q || q.length < 3) {
      throw new BadRequestException('Query must be at least 3 characters');
    }

    // Check Redis cache first
    const cacheKey = `location:${q.toLowerCase().trim()}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const { data } = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q,
            format: 'json',
            addressdetails: 1,
            limit: 5,
            countrycodes: 'in',
          },
          headers: {
            'User-Agent': 'SheRide/1.0 (support@sheride.com)',
            'Accept-Language': 'en',
          },
        },
      );

      // Cache for 24 hours — addresses don't change often
      await redis.setex(cacheKey, 86400, JSON.stringify(data));

      return data;
    } catch (err: any) {
      if (err?.response?.status === 429) {
        throw new HttpException(
          'Location service is busy, try again in a moment',
          429,
        );
      }
      throw new HttpException('Location search failed', 500);
    }
  }
}
