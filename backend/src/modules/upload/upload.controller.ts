import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller(['api/upload', 'api/v1/upload'])
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  async uploadFile(@Body() body: { fileName: string; fileType?: string; fileSize?: number; fileData?: string }) {
    if (!body.fileName) {
      throw new BadRequestException('fileName is required');
    }

    const ext = body.fileName.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip', 'csv', 'txt'];

    if (!ext || !allowedExtensions.includes(ext)) {
      throw new BadRequestException(`File type .${ext} is not allowed. Supported formats: images, pdf, documents, zip, spreadsheets.`);
    }

    const maxSizeBytes = 25 * 1024 * 1024; // 25MB
    if (body.fileSize && body.fileSize > maxSizeBytes) {
      throw new BadRequestException('File size exceeds the 25MB maximum corporate limit.');
    }

    const uniqueId = uuidv4().slice(0, 8);
    const sanitizedName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageUrl = `https://storage.supabase.co/v0/object/public/portal-assets/${uniqueId}_${sanitizedName}`;

    return {
      success: true,
      fileUrl: storageUrl,
      fileName: body.fileName,
      fileSize: body.fileSize || 102400,
      fileType: body.fileType || `application/${ext}`,
    };
  }
}
