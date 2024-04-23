import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';

@ApiTags('Crypto')
@Controller()
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('/get-encrypt-data')
  async getEncryptedData(@Body() payload: any) {
    return this.cryptoService.getEncryptedData(payload);
  }

  @Post('/get-decrypt-data')
  async getDecryptedData(@Body() data: any) {
    return this.cryptoService.getDecryptedData(data);
  }
}
