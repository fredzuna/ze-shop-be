import { Inject, Injectable } from '@nestjs/common';
import { WeatherQuery } from './dto/WeatherQuery';
import { FileService } from '../file/file.service';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { IWeatherData } from '../interface/IWeatherData';
import { ConfigService } from '@nestjs/config';

const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';

@Injectable()
export class WeatherService {
  @Inject(FileService)
  private readonly fileService: FileService;
  private weatherApiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.weatherApiKey = this.configService.get<string>('WEATHER_API_KEY');
  }

  getLogCacheId(city: string) {
    const today = new Date().toLocaleDateString();
    return `${city}-${today}`;
  }

  async getWeatherDataFromApiCall(city: string): Promise<IWeatherData> {
    const params = {
      key: this.weatherApiKey,
      q: city,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<IWeatherData>(WEATHER_API_URL, { params }).pipe(
          catchError((error: AxiosError) => {
            throw `An error happened! ${error.message}`;
          }),
        ),
      );

      return data;
    } catch (error) {
      console.log(error.message)
      throw new Error(`Error calling Weather API: ${error.message}`);
    }
  }

  logToFileSync(url: string, query: WeatherQuery) {
    const logEntry = this.prepareLogEntry(url, query);
    this.saveLogFile('./src/db/weatherapi.log', logEntry);
  }

  async saveLogFile(filePath, logEntry) {
    try {
      const existingContent = await this.fileService.createOrReadFile(
        filePath,
        '',
      );
      await this.fileService.writeFile(filePath, logEntry + existingContent);
    } catch (error) {
      console.error('Error writing to log ile:', error);
    }
  }

  prepareLogEntry(url: string, query: WeatherQuery) {
    const timestamp = new Date().toISOString();
    const endpointUrl = WEATHER_API_URL + url;
    const logEntry = `${timestamp}|${JSON.stringify(query)}|${endpointUrl}\n`;

    return logEntry;
  }
}
