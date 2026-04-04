import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerLoginService, ICustomerLoginServiceOutput } from '../../services/customer-login/customer-login.service';
import { CustomerLoginDto } from './customer-login.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Customers')
@Controller('customer')
class CustomerLoginController {
  constructor(private readonly customerLoginService: CustomerLoginService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async execute(
    @Body() body: CustomerLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const output = await this.customerLoginService.execute({
      email: body.email,
      password: body.password,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    const result = output.result as ICustomerLoginServiceOutput;

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return {
      id: result.id,
      access_token: result.access_token,
      access_token_expiration_date: result.access_token_expiration_date,
      refresh_token_expiration_date: result.refresh_token_expiration_date,
    };
  }
}

export { CustomerLoginController };
