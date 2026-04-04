import { IsString } from 'class-validator';

export class ChangeSellerNameDto {
  @IsString() name: string;
}
