import { Controller, Get, HttpCode, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetOrdersForCustomersService,
  IGetOrdersForCustomersServiceOutput,
} from '../../services/get-orders-for-customers/get-orders-for-customers.service';
import { CustomerJwtGuard } from '../../../customers/auth/customer-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Orders')
@Controller('orders')
class GetOrdersForCustomersController {
  constructor(private readonly getOrdersForCustomersService: GetOrdersForCustomersService) {}

  @Get('for-customers')
  @HttpCode(200)
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders for the authenticated customer' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Req() req: Request & { user: { customerId: string } },
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size: number = 10,
  ) {
    const output = await this.getOrdersForCustomersService.execute({
      customerId: req.user.customerId,
      page,
      size,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IGetOrdersForCustomersServiceOutput;
  }
}

export { GetOrdersForCustomersController };
