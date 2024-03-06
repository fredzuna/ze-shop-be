import { Controller, Get, Query, Req } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherQuery } from './dto/WeatherQuery';
import { Request } from 'express';
import { IWeatherData } from '../interface/IWeatherData';
import { DatabaseService } from '../database/database.service';

@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  async getWeather(
    @Query() query: WeatherQuery,
    @Req() req: Request,
  ): Promise<IWeatherData> {
    const city = query.q;
    const cacheId = this.weatherService.getLogCacheId(city);
    const cachedData = this.databaseService.findById(cacheId);

    if (cachedData) {
      return cachedData;
    } else {
      const weatherData =
        await this.weatherService.getWeatherDataFromApiCall(city);

      this.databaseService.setById(cacheId, weatherData);
      this.weatherService.logToFileSync(req.originalUrl, query);

      return weatherData;
    }
  }
}
