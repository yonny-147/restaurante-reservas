import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { TablesModule } from './modules/tables/tables.module';

@Module({
  imports: [ReservationsModule, TablesModule, HealthModule],
})
export class AppModule {}
