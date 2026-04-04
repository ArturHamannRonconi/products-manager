import { Body, Controller, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeCustomerNameService } from '../../services/change-customer-name/change-customer-name.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { ChangeCustomerNameDto } from './change-customer-name.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Customers')
@Controller('customer')
class ChangeCustomerNameController {
  constructor(
    private readonly changeCustomerNameService: ChangeCustomerNameService,
  ) {}

  @Patch('name')
  @HttpCode(204)
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change customer name' })
  @ApiResponse({ status: 204, description: 'Name changed' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: ChangeCustomerNameDto,
    @Req() req: Request & { user: { customerId: string } },
  ) {
    const output = await this.changeCustomerNameService.execute({
      customerId: req.user.customerId,
      name: body.name,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }
  }
}

export { ChangeCustomerNameController };
