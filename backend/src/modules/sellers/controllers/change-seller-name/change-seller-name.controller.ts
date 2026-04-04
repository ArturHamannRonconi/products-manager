import { Body, Controller, HttpCode, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChangeSellerNameService } from '../../services/change-seller-name/change-seller-name.service';
import { SellerJwtGuard } from '../../auth/seller-jwt.guard';
import { ChangeSellerNameDto } from './change-seller-name.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('seller')
class ChangeSellerNameController {
  constructor(
    private readonly changeSellerNameService: ChangeSellerNameService,
  ) {}

  @Patch('name')
  @HttpCode(204)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change seller name' })
  @ApiResponse({ status: 204, description: 'Name changed' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: ChangeSellerNameDto,
    @Req() req: Request & { user: { sellerId: string } },
  ) {
    const output = await this.changeSellerNameService.execute({
      sellerId: req.user.sellerId,
      name: body.name,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }
  }
}

export { ChangeSellerNameController };
