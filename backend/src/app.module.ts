import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostgresModule } from './postgres/postgres.module';
import { PostgresService } from './postgres/postgres.service';

@Module({
  imports: [PostgresModule],
  controllers: [AppController],
  providers: [AppService, PostgresService],
})
export class AppModule {
  constructor(private readonly postgresService: PostgresService) {}

  // Когда приложение запускается, проверяем наличие базы данных и подключаемся
  async onModuleInit() {
    await this.postgresService.connectSuperUser();
    await this.postgresService.createDatabaseIfNotExist('projectud'); // Имя базы данных
    await this.postgresService.connectToDatabase('projectud'); // Подключаемся к базе данных
  }

  // Отключаем клиента, когда приложение завершает работу
  async onModuleDestroy() {
    await this.postgresService.disconnectClient();
  }
}
