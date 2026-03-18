import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

interface ImgbbResponse {
  data: {
    url: string;
  };
}

@Injectable()
export class AuctionImageService {
  private readonly imgbbApiKey: string;

  constructor(private configService: ConfigService) {
    this.imgbbApiKey = this.configService.get<string>('IMGBB_API_KEY') || '';
    if (!this.imgbbApiKey) {
      console.warn('IMGBB_API_KEY is not set in environment variables');
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    itemName: string,
  ): Promise<string> {
    if (!this.imgbbApiKey) {
      throw new InternalServerErrorException(
        'Image upload service is not configured (missing API Key)',
      );
    }

    try {
      const timestamp = Date.now();
      const cleanName = itemName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const customFilename = `${cleanName}_${timestamp}`;

      const formData = new FormData();
      // Send the buffer directly as a file
      formData.append('image', file.buffer, {
        filename: customFilename + '.jpg',
        contentType: 'image/jpeg',
      });
      formData.append('key', this.imgbbApiKey);
      formData.append('name', customFilename);

      const response = await axios.post<ImgbbResponse>(
        'https://api.imgbb.com/1/upload',
        formData,
        {
          headers: formData.getHeaders() as Record<string, string>,
        },
      );

      if (response.data && response.data.data && response.data.data.url) {
        return response.data.data.url;
      }

      throw new Error('Invalid response from IMGBB');
    } catch (error: unknown) {
      const err = error as { response?: { data?: any }; message?: string };
      console.error('IMGBB Upload Error:', err.response?.data || err.message);
      throw new InternalServerErrorException('Failed to upload image to IMGBB');
    }
  }

  async streamImage(url: string): Promise<any> {
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      return response;
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch image from remote source',
      );
    }
  }
}
