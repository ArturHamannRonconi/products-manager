import { Body, Controller, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeCustomerPasswordService } from '../../services/change-customer-password/change-customer-password.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { ChangeCustomerPasswordDto } from './change-customer-password.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Customers')
@Controller('customer')
class ChangeCustomerPasswordController {
  constructor(
    private readonly changeCustomerPasswordService: ChangeCustomerPasswordService,
  ) {}

  @Patch('password')
  @HttpCode(204)
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change customer password' })
  @ApiResponse({ status: 204, description: 'Password changed' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: ChangeCustomerPasswordDto,
    @Req() req: Request & { user: { customerId: string } },
  ) {
    const output = await this.changeCustomerPasswordService.execute({
      customerId: req.user.customerId,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }
  }
}

export { ChangeCustomerPasswordController };
