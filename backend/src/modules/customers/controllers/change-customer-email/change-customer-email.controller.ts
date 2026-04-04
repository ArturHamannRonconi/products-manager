import { Body, Controller, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeCustomerEmailService } from '../../services/change-customer-email/change-customer-email.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { ChangeCustomerEmailDto } from './change-customer-email.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Customers')
@Controller('customer')
class ChangeCustomerEmailController {
  constructor(
    private readonly changeCustomerEmailService: ChangeCustomerEmailService,
  ) {}

  @Patch('email')
  @HttpCode(204)
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change customer email' })
  @ApiResponse({ status: 204, description: 'Email changed' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: ChangeCustomerEmailDto,
    @Req() req: Request & { user: { customerId: string } },
  ) {
    const output = await this.changeCustomerEmailService.execute({
      customerId: req.user.customerId,
      email: body.email,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }
  }
}

export { ChangeCustomerEmailController };
