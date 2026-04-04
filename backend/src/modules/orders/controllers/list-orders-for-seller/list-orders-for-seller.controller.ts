import { Controller, Get, HttpCode, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ListOrdersForSellerUseCase,
} from '../../services/list-orders-for-seller/list-orders-for-seller.usecase';
import { IListOrdersForSellerServiceOutput } from '../../services/list-orders-for-seller/list-orders-for-seller.output';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Orders')
@Controller('orders')
class ListOrdersForSellerController {
  constructor(private readonly listOrdersForSellerUseCase: ListOrdersForSellerUseCase) {}

  @Get('for-sellers')
  @HttpCode(200)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders containing the authenticated seller\'s products' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Req() req: Request & { user: { sellerId: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size: number = 10,
  ) {
    const output = await this.listOrdersForSellerUseCase.execute({
      sellerId: req.user.sellerId,
      page,
      size,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IListOrdersForSellerServiceOutput;
  }
}

export { ListOrdersForSellerController };
