import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBatchCustomersService, ICreateBatchCustomersServiceOutput } from '../../services/create-batch-customers/create-batch-customers.service';
import { CreateBatchCustomersDto } from './create-batch-customers.dto';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Customers')
@Controller('customers')
class CreateBatchCustomersController {
  constructor(
    private readonly createBatchCustomersService: CreateBatchCustomersService,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create customers in batch' })
  @ApiResponse({ status: 201, description: 'Customers created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async execute(@Body() body: CreateBatchCustomersDto) {
    const output = await this.createBatchCustomersService.execute({
      customers: body.customers,
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as ICreateBatchCustomersServiceOutput;
  }
}

export { CreateBatchCustomersController };
