import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { FileService } from '../file/file.service';
import { DatabaseService } from '../database/database.service';

@Module({
  imports: [HttpModule],
  controllers: [WeatherController],
  providers: [WeatherService, FileService, DatabaseService],
})
export class WeatherModule {}
