import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_CUSTOMER_SECRET'),
    });
  }

  validate(payload: { sub: string; type: string }) {
    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Invalid token type');
    }
    return { customerId: payload.sub };
  }
}
