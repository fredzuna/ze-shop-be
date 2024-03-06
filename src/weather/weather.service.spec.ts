import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService, HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { IWeatherData } from '../interface/IWeatherData';
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

describe('WeatherService', () => {
  let weatherService: WeatherService;
  let httpService: HttpService;
  let configService: ConfigService;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [WeatherService, ConfigService, FileService],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    fileService = module.get<FileService>(FileService);
  });

  describe('getLogCacheId', () => {
    it('should return a cache id with the city and today date', () => {
      const city = 'TestCity';
      const cacheId = weatherService.getLogCacheId(city);

      const today = new Date().toLocaleDateString();
      const expectedCacheId = `${city}-${today}`;

      expect(cacheId).toBe(expectedCacheId);
    });
  });

  describe('getWeatherDataFromApiCall', () => {
    it('should return weather data from the API', async () => {
      const city = 'TestCity';
      const mockWeatherData: IWeatherData = mockData;

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(
          of({
            data: mockWeatherData,
          } as AxiosResponse<IWeatherData>),
        );

      const result = await weatherService.getWeatherDataFromApiCall(city);

      expect(result).toEqual(mockWeatherData);
    });

    it('should throw an error if the API call fails', async () => {
      const city = 'TestCity';

      jest.spyOn(configService, 'get').mockReturnValue('mockedApiKey');
      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(throwError(() => new Error('API error')));

      await expect(weatherService.getWeatherDataFromApiCall(city)).rejects.toThrow(
        'Error calling Weather API',
      );
    });
  });

  describe('saveLogFile', () => {
    it('should save log file successfully', async () => {
      const filePath = './src/db/weatherapi.log';
      const logEntry = 'test-log-entry';

      jest
        .spyOn(fileService, 'createOrReadFile')
        .mockResolvedValueOnce('ExistingContent');
      jest.spyOn(fileService, 'writeFile').mockResolvedValueOnce();
      
      await weatherService.saveLogFile(filePath, logEntry);

      expect(fileService.createOrReadFile).toHaveBeenCalledWith(filePath, '');
      expect(fileService.writeFile).toHaveBeenCalledWith(
        filePath,
        logEntry + 'ExistingContent',
      );
    });

    it('should handle error during file write', async () => {
      const filePath = './src/db/weatherapi.log';
      const logEntry = 'test-log-entry';

      jest
        .spyOn(fileService, 'createOrReadFile')
        .mockResolvedValueOnce('ExistingContent');
      jest.spyOn(fileService, 'writeFile').mockRejectedValueOnce('WriteError');

      await weatherService.saveLogFile(filePath, logEntry).catch((error) => {
        expect(fileService.createOrReadFile).toHaveBeenCalledWith(filePath, '');
        expect(fileService.writeFile).toHaveBeenCalledWith(
          filePath,
          logEntry + 'ExistingContent',
        );
        expect(error).toEqual('WriteError');
      });
    });
  });
});