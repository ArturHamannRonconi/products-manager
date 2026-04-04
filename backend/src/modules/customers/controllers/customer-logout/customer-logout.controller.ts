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
import { CustomerLogoutService } from '../../services/customer-logout/customer-logout.service';
import { CustomerJwtGuard } from '../../auth/customer-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Customers')
@Controller('customer')
class CustomerLogoutController {
  constructor(private readonly customerLogoutService: CustomerLogoutService) {}

  @Post('logout')
  @HttpCode(200)
  @UseGuards(CustomerJwtGuard)
  @ApiOperation({ summary: 'Customer logout' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Req() req: Request & { user: { customerId: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const output = await this.customerLogoutService.execute({
      customerId: req.user.customerId,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    res.clearCookie('refresh_token');
    return {};
  }
}

export { CustomerLogoutController };
