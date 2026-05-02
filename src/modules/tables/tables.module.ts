import { Module, forwardRef } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

@Module({
  imports: [forwardRef(() => ReservationsModule)],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService],
})
export class TablesModule {}
