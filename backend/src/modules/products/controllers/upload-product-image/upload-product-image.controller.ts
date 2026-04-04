import { Controller, HttpCode, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadProductImageService, IUploadProductImageServiceOutput } from '../../services/upload-product-image/upload-product-image.service';
import { SellerJwtGuard } from '../../../sellers/auth/seller-jwt.guard';
import { getCorrectNestjsErrorByOutput } from '../../../../utils/get-nestjs-error.util';

@ApiTags('Products')
@Controller('product')
class UploadProductImageController {
  constructor(private readonly uploadProductImageService: UploadProductImageService) {}

  @Post(':id/image')
  @HttpCode(200)
  @UseGuards(SellerJwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async execute(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const output = await this.uploadProductImageService.execute({
      productId: id,
      file: {
        filename: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
      },
    });

    if (output.isFailure) {
      throw getCorrectNestjsErrorByOutput(output as any);
    }

    return output.result as IUploadProductImageServiceOutput;
  }
}

export { UploadProductImageController };
