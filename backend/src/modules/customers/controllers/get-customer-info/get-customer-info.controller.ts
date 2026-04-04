import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCustomerInfoService, IGetCustomerInfoServiceOutput } from '../../services/get-customer-info/get-customer-info.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Customers')
@Controller('customer')
class GetCustomerInfoController {
  constructor(private readonly getCustomerInfoService: GetCustomerInfoService) {}

  @Get()
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer info' })
  @ApiResponse({ status: 200, description: 'Customer info returned' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(@Req() req: Request & { user: { customerId: string } }) {
    const output = await this.getCustomerInfoService.execute({
      customerId: req.user.customerId,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IGetCustomerInfoServiceOutput;
  }
}

export { GetCustomerInfoController };
