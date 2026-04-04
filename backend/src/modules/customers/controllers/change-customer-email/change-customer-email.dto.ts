import { IsEmail } from 'class-validator';

export class ChangeCustomerEmailDto {
  @IsEmail() email: string;
}
