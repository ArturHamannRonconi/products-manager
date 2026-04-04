import { BadRequestException, Controller, Get, HttpCode, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetProductsForCustomersService, IGetProductsForCustomersServiceOutput } from '../../services/get-products-for-customers/get-products-for-customers.service';
import { CustomerJwtGuard } from '../../../customers/auth/customer-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

const VALID_SORT_BY = ['name', 'price', 'createdAt'];
const VALID_ORDER = ['asc', 'desc'];

@ApiTags('Products')
@Controller('products')
class GetProductsForCustomersController {
  constructor(private readonly getProductsForCustomersService: GetProductsForCustomersService) {}

  @Get('for-customers')
  @HttpCode(200)
  @UseGuards(CustomerJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List products for customers' })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['name', 'price', 'createdAt'], description: 'Field to sort by (default: createdAt)' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  @ApiQuery({ name: 'min_price', required: false, type: Number, description: 'Filter products with price >= min_price' })
  @ApiQuery({ name: 'max_price', required: false, type: Number, description: 'Filter products with price <= max_price' })
  @ApiResponse({ status: 200, description: 'Products listed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid sort_by, order, or price value' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async execute(
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

    const output = await this.getProductsForCustomersService.execute({
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

    return output.result as IGetProductsForCustomersServiceOutput;
  }
}

export { GetProductsForCustomersController };
