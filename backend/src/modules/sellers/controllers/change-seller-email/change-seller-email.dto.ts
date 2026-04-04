import { IsEmail } from 'class-validator';

export class ChangeSellerEmailDto {
  @IsEmail() email: string;
}
