import { Body, Controller, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeSellerPasswordService } from '../../services/change-seller-password/change-seller-password.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { ChangeSellerPasswordDto } from './change-seller-password.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('seller')
class ChangeSellerPasswordController {
  constructor(
    private readonly changeSellerPasswordService: ChangeSellerPasswordService,
  ) {}

  @Patch('password')
  @HttpCode(204)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change seller password' })
  @ApiResponse({ status: 204, description: 'Password changed' })
  @ApiResponse({ status: 401, description: 'Old password incorrect' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: ChangeSellerPasswordDto,
    @Req() req: Request & { user: { sellerId: string } },
  ) {
    const output = await this.changeSellerPasswordService.execute({
      sellerId: req.user.sellerId,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }
  }
}

export { ChangeSellerPasswordController };
