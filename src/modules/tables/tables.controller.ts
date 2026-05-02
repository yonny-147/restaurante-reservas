import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { QueryAvailableDto } from './dto/query-available.dto';
import { Table } from './entities/table.entity';
import { TablesService } from './tables.service';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las mesas del restaurante' })
  @ApiOkResponse({ type: Table, isArray: true })
  findAll(): Table[] {
    return this.tablesService.findAll();
  }

  @Get('available')
  @ApiOperation({
    summary: 'Consultar mesas disponibles por fecha y franja horaria',
  })
  @ApiOkResponse({ type: Table, isArray: true })
  @ApiBadRequestResponse({
    description: 'La franja horaria solicitada no es válida',
  })
  findAvailable(@Query() query: QueryAvailableDto): Table[] {
    return this.tablesService.findAvailable(query.date, query.time);
  }
}
