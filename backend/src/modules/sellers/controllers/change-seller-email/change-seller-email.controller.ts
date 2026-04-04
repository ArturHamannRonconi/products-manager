import { Body, Controller, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeSellerEmailService } from '../../services/change-seller-email/change-seller-email.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { ChangeSellerEmailDto } from './change-seller-email.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('seller')
class ChangeSellerEmailController {
  constructor(
    private readonly changeSellerEmailService: ChangeSellerEmailService,
  ) {}

  @Patch('email')
  @HttpCode(204)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change seller email' })
  @ApiResponse({ status: 204, description: 'Email changed' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  async execute(
    @Body() body: ChangeSellerEmailDto,
    @Req() req: Request & { user: { sellerId: string } },
  ) {
    const output = await this.changeSellerEmailService.execute({
      sellerId: req.user.sellerId,
      email: body.email,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }
  }
}

export { ChangeSellerEmailController };
