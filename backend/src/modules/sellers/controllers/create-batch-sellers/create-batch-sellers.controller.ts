import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBatchSellersService, ICreateBatchSellersServiceOutput } from '../../services/create-batch-sellers/create-batch-sellers.service';
import { CreateBatchSellersDto } from './create-batch-sellers.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Sellers')
@Controller('sellers')
class CreateBatchSellersController {
  constructor(
    private readonly createBatchSellersService: CreateBatchSellersService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create sellers in batch' })
  @ApiResponse({ status: 201, description: 'Sellers created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async execute(@Body() body: CreateBatchSellersDto) {
    const output = await this.createBatchSellersService.execute({
      sellers: body.sellers,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as ICreateBatchSellersServiceOutput;
  }
}

export { CreateBatchSellersController };
