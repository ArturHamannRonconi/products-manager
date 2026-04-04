import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateBatchOrdersService,
  ICreateBatchOrdersServiceOutput,
} from '../../services/create-batch-orders/create-batch-orders.service';
import { CustomerJwtGuard } from '../../../customers/auth/customer-jwt.guard';
import { CreateBatchOrdersDto } from './create-batch-orders.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Orders')
@Controller('orders')
class CreateBatchOrdersController {
  constructor(private readonly createBatchOrdersService: CreateBatchOrdersService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create orders in batch' })
  @ApiResponse({ status: 201, description: 'Orders created successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock or invalid data' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: CreateBatchOrdersDto,
    @Req() req: Request & { user: { customerId: string } },
  ) {
    const output = await this.createBatchOrdersService.execute({
      orders: body.orders,
      customerId: req.user.customerId,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as ICreateBatchOrdersServiceOutput;
  }
}

export { CreateBatchOrdersController };
