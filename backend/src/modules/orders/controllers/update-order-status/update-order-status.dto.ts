import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

class UpdateOrderStatusDto {
  @ApiProperty({ example: 'processing', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] })
  @IsString()
  status: string;
}

export { UpdateOrderStatusDto };
