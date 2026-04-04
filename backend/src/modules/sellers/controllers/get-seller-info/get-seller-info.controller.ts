import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetSellerInfoService, IGetSellerInfoServiceOutput } from '../../services/get-seller-info/get-seller-info.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('seller')
class GetSellerInfoController {
  constructor(private readonly getSellerInfoService: GetSellerInfoService) {}

  @Get()
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller info' })
  @ApiResponse({ status: 200, description: 'Seller info returned' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(@Req() req: Request & { user: { sellerId: string } }) {
    const output = await this.getSellerInfoService.execute({
      sellerId: req.user.sellerId,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IGetSellerInfoServiceOutput;
  }
}

export { GetSellerInfoController };
