import { IsString } from 'class-validator';

export class ChangeSellerOrgDto {
  @IsString() name: string;
}
