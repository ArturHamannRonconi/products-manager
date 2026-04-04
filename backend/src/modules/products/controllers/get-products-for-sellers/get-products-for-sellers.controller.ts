import { BadRequestException, Controller, Get, HttpCode, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetProductsForSellersService, IGetProductsForSellersServiceOutput } from '../../services/get-products-for-sellers/get-products-for-sellers.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

const VALID_SORT_BY = ['name', 'price', 'createdAt'];
const VALID_ORDER = ['asc', 'desc'];

@ApiTags('Products')
@Controller('products')
class GetProductsForSellersController {
  constructor(private readonly getProductsForSellersService: GetProductsForSellersService) {}

  @Get('for-sellers')
  @HttpCode(200)
  @UseGuards(SellerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List products for sellers' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['name', 'price', 'createdAt'], description: 'Field to sort by (default: createdAt)' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  @ApiQuery({ name: 'min_price', required: false, type: Number, description: 'Filter products with price >= min_price' })
  @ApiQuery({ name: 'max_price', required: false, type: Number, description: 'Filter products with price <= max_price' })
  @ApiResponse({ status: 200, description: 'Products listed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid sort_by, order, or price value' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
    @Req() req: Request & { user: { sellerId: string } },
    @Query('size', ParseIntPipe) size: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('searchByText') searchByText?: string,
    @Query('sort_by') sortBy: string = 'createdAt',
    @Query('order') order: string = 'desc',
    @Query('min_price') minPriceRaw?: string,
    @Query('max_price') maxPriceRaw?: string,
  ) {
    if (!VALID_SORT_BY.includes(sortBy)) {
      throw new BadRequestException(`Invalid sort_by value. Allowed: ${VALID_SORT_BY.join(', ')}`);
    }
    if (!VALID_ORDER.includes(order)) {
      throw new BadRequestException(`Invalid order value. Allowed: ${VALID_ORDER.join(', ')}`);
    }

    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (minPriceRaw !== undefined) {
      minPrice = parseFloat(minPriceRaw);
      if (isNaN(minPrice)) throw new BadRequestException('min_price must be a valid number.');
    }
    if (maxPriceRaw !== undefined) {
      maxPrice = parseFloat(maxPriceRaw);
      if (isNaN(maxPrice)) throw new BadRequestException('max_price must be a valid number.');
    }

    const output = await this.getProductsForSellersService.execute({
      sellerId: req.user.sellerId,
      page,
      size,
      searchByText,
      sortBy,
      order,
      minPrice,
      maxPrice,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IGetProductsForSellersServiceOutput;
  }
}

export { GetProductsForSellersController };
