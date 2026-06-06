import { ApiProperty } from '@nestjs/swagger';

/**
 * Ubicación física de la mesa dentro del restaurante.
 */
export enum TableLocation {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR',
  TERRACE = 'TERRACE',
  PRIVATE = 'PRIVATE',
}

/**
 * Entidad Mesa (almacenamiento en memoria).
 */
export class Table {
  @ApiProperty({ example: 1, description: 'Identificador único de la mesa' })
  id: number;

  @ApiProperty({ example: 'A1', description: 'Etiqueta visible de la mesa' })
  label: string;

  @ApiProperty({ example: 4, description: 'Capacidad máxima de comensales' })
  capacity: number;

  @ApiProperty({ enum: TableLocation, example: TableLocation.INDOOR })
  location: TableLocation;
}
