import { Body, Controller, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeSellerOrganizationService } from '../../services/change-seller-organization/change-seller-organization.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { ChangeSellerOrgDto } from './change-seller-org.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('seller')
class ChangeSellerOrgController {
  constructor(
    private readonly changeSellerOrganizationService: ChangeSellerOrganizationService,
  ) {}

  @Patch('org')
  @HttpCode(204)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change seller organization name' })
  @ApiResponse({ status: 204, description: 'Organization name changed' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: ChangeSellerOrgDto,
    @Req() req: Request & { user: { sellerId: string } },
  ) {
    const output = await this.changeSellerOrganizationService.execute({
      sellerId: req.user.sellerId,
      name: body.name,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }
  }
}

export { ChangeSellerOrgController };
