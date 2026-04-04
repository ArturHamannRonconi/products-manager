import {
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SellerLogoutService } from '../../services/seller-logout/seller-logout.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('seller')
class SellerLogoutController {
  constructor(private readonly sellerLogoutService: SellerLogoutService) {}

  @Post('logout')
  @HttpCode(200)
  @UseGuards(SellerJwtGuard)
  @ApiOperation({ summary: 'Seller logout' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Req() req: Request & { user: { sellerId: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const output = await this.sellerLogoutService.execute({
      sellerId: req.user.sellerId,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    res.clearCookie('refresh_token');
    return {};
  }
}

export { SellerLogoutController };
