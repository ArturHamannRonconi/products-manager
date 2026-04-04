import { Controller, Delete, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeleteProductService } from '../../services/delete-product/delete-product.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Products')
@Controller('product')
class DeleteProductController {
  constructor(private readonly deleteProductService: DeleteProductService) {}

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async execute(@Param('id') id: string) {
    const output = await this.deleteProductService.execute({ productId: id });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return { message: 'Product deleted successfully.' };
  }
}

export { DeleteProductController };
