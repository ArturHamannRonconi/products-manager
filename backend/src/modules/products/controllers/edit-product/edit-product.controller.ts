import { Body, Controller, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EditProductService, IEditProductServiceOutput } from '../../services/edit-product/edit-product.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { EditProductDto } from './edit-product.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Products')
@Controller('product')
class EditProductController {
  constructor(private readonly editProductService: EditProductService) {}

  @Put(':id')
  @HttpCode(200)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async execute(@Param('id') id: string, @Body() body: EditProductDto) {
    const output = await this.editProductService.execute({
      productId: id,
      ...body,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IEditProductServiceOutput;
  }
}

export { EditProductController };
