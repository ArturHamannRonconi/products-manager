import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SellerJwtStrategy extends PassportStrategy(Strategy, 'seller-jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SELLER_SECRET'),
    });
  }

  validate(payload: { sub: string; type: string }) {
    if (payload.type !== 'seller') {
      throw new UnauthorizedException('Invalid token type');
    }
    return { sellerId: payload.sub };
  }
}
