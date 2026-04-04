import { Body, Controller, HttpCode, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  UpdateOrderStatusService,
  IUpdateOrderStatusServiceOutput,
} from '../../services/update-order-status/update-order-status.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { UpdateOrderStatusDto } from './update-order-status.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Orders')
@Controller('orders')
class UpdateOrderStatusController {
  constructor(private readonly updateOrderStatusService: UpdateOrderStatusService) {}

  @Patch(':id/status')
  @HttpCode(200)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status or invalid status transition' })
  @ApiResponse({ status: 403, description: 'Unauthorized or does not own the order' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async execute(@Param('id') id: string, @Body() body: UpdateOrderStatusDto, @Req() req: any) {
    const output = await this.updateOrderStatusService.execute({
      orderId: id,
      status: body.status,
      sellerId: req.user.sellerId,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IUpdateOrderStatusServiceOutput;
  }
}

export { UpdateOrderStatusController };
