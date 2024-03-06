import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { DatabaseService } from '../database/database.service';
import { WeatherQuery } from './dto/WeatherQuery';
import { Request } from 'express';
import { IWeatherData } from '../interface/IWeatherData';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FileService } from '../file/file.service';

const mockData = {
  "location": {
      "name": "Londres",
      "region": "Catamarca",
      "country": "Argentina",
      "lat": -27.72,
      "lon": -67.12,
      "tz_id": "America/Argentina/Catamarca",
      "localtime_epoch": 1700677490,
      "localtime": "2023-11-22 15:24"
  },
  "current": {
      "last_updated_epoch": 1700676900,
      "last_updated": "2023-11-22 15:15",
      "temp_c": 19.8,
      "temp_f": 67.6,
      "is_day": 1,
      "condition": {
          "text": "Patchy rain possible",
          "icon": "//cdn.weatherapi.com/weather/64x64/day/176.png",
          "code": 1063
      },
      "wind_mph": 8.3,
      "wind_kph": 13.3,
      "wind_degree": 147,
      "wind_dir": "SSE",
      "pressure_mb": 1008,
      "pressure_in": 29.77,
      "precip_mm": 0.02,
      "precip_in": 0,
      "humidity": 62,
      "cloud": 79,
      "feelslike_c": 19.8,
      "feelslike_f": 67.6,
      "vis_km": 10,
      "vis_miles": 6,
      "uv": 4,
      "gust_mph": 9.5,
      "gust_kph": 15.3
  }
}

describe('WeatherController', () => {
  let weatherController: WeatherController;
  let weatherService: WeatherService;
  let databaseService: DatabaseService;
  let configService: ConfigService;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [WeatherController],
      providers: [
        WeatherService,
        DatabaseService,
        ConfigService,
        FileService
      ],
    }).compile();

    weatherController = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    configService = module.get<ConfigService>(ConfigService);
    fileService = module.get<FileService>(FileService);
  });

  describe('getWeather', () => {
    it('should return cached weather data', async () => {
      const query: WeatherQuery = { q: 'TestCity' };
      const requestMock: Partial<Request> = { originalUrl: '/weather?q=TestCity' };
      const cachedWeatherData: IWeatherData = mockData;

      jest.spyOn(weatherService, 'getLogCacheId').mockReturnValue('testCacheId');
      jest.spyOn(databaseService, 'findById').mockReturnValue(cachedWeatherData);

      const result = await weatherController.getWeather(query, requestMock as Request);

      expect(result).toBe(cachedWeatherData);
      expect(databaseService.findById).toHaveBeenCalledWith('testCacheId');
    });

    it('should make new API call and return weather data', async () => {
      const query: WeatherQuery = { q: 'NewCity' };
      const requestMock: Partial<Request> = { originalUrl: '/weather?q=NewCity' };
      const newWeatherData: IWeatherData = mockData;

      jest.spyOn(weatherService, 'getLogCacheId').mockReturnValue('newCacheId');
      jest.spyOn(databaseService, 'findById').mockReturnValue(null);
      jest.spyOn(weatherService, 'getWeatherDataFromApiCall').mockResolvedValue(newWeatherData);
      jest.spyOn(databaseService, 'setById').mockReturnValue();
      jest.spyOn(weatherService, 'logToFileSync').mockReturnValue();

      const result = await weatherController.getWeather(query, requestMock as Request);

      expect(result).toBe(newWeatherData);
      expect(weatherService.getWeatherDataFromApiCall).toHaveBeenCalledWith('NewCity');
      expect(databaseService.setById).toHaveBeenCalledWith('newCacheId', newWeatherData);
      expect(weatherService.logToFileSync).toHaveBeenCalledWith('/weather?q=NewCity', query);
    });
  });
});
