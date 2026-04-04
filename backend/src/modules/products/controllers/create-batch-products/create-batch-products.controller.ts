import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBatchProductsService, ICreateBatchProductsServiceOutput } from '../../services/create-batch-products/create-batch-products.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { CreateBatchProductsDto } from './create-batch-products.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Products')
@Controller('products')
class CreateBatchProductsController {
  constructor(private readonly createBatchProductsService: CreateBatchProductsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create products in batch' })
  @ApiResponse({ status: 201, description: 'Products created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product data' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Body() body: CreateBatchProductsDto,
    @Req() req: Request & { user: { sellerId: string } },
  ) {
    const output = await this.createBatchProductsService.execute({
      products: body.products,
      sellerId: req.user.sellerId,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as ICreateBatchProductsServiceOutput;
  }
}

export { CreateBatchProductsController };
