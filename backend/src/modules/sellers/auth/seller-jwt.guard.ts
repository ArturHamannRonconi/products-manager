import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SellerJwtGuard extends AuthGuard('seller-jwt') {}
