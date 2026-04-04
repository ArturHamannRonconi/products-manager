import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SellerRefreshTokenService } from '../../services/seller-refresh-token/seller-refresh-token.service';
import { ISellerLoginServiceOutput } from '../../services/seller-login/seller-login.service';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('seller')
class SellerRefreshTokenController {
  constructor(
    private readonly sellerRefreshTokenService: SellerRefreshTokenService,
  ) {}

  @Post('refresh-token')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh seller tokens' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 403, description: 'Invalid or expired refresh token' })
  async execute(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];

    const output = await this.sellerRefreshTokenService.execute({
      refreshToken,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    const result = output.result as ISellerLoginServiceOutput;

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      id: result.id,
      access_token: result.access_token,
      access_token_expiration_date: result.access_token_expiration_date,
      refresh_token_expiration_date: result.refresh_token_expiration_date,
    };
  }
}

export { SellerRefreshTokenController };
