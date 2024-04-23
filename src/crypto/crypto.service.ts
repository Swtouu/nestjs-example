import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import * as fs from 'fs';

@Injectable()
export class CryptoService {
  private privateKey: string;
  private publicKey: string;
  private aesKey: string;

  constructor() {
    // read key from files
    this.privateKey = fs.readFileSync('src/key/private.pem', 'utf-8');
    this.publicKey = fs.readFileSync('src/key/public.pem', 'utf-8');
    this.aesKey = this.generateAESKey(); // generate AES as global variable
  }

  // validate length and string request
  validatePayload(payload: any): boolean {
    if (
      !payload ||
      typeof payload.payload !== 'string' ||
      payload.payload.length > 2000
    ) {
      return false;
    }
    return true;
  }

  // generate AES
  generateAESKey(): string {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  }

  // AES encryption function
  encryptWithAES(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  // RSA encryption function
  encryptWithRSA(data: string, publicKey: string): string {
    return CryptoJS.AES.encrypt(data, publicKey).toString();
  }

  // RSA decryption function
  decryptWithRSA(data: string, privateKey: string): string {
    const bytes = CryptoJS.AES.decrypt(data, privateKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // AES decryption function
  decryptWithAES(data: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(data, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  getEncryptedData(payload: any): {
    successful: boolean;
    error_code?: string;
    data?: { data1: string; data2: string };
  } {
    try {
      // 1. Validate request payload with above requirement
      if (!this.validatePayload(payload)) {
        return { successful: false, error_code: 'Invalid payload.' };
      }

      // 2. Create AES key by Generate random string using global variables as above

      // 3. For data2, encrypt payload with AES key from step2.
      const encryptedPayload = this.encryptWithAES(
        payload.payload,
        this.aesKey,
      );

      // 4. For data1, encrypt key from step2 with private key
      const encryptedAesKey = this.encryptWithRSA(this.aesKey, this.publicKey); // using public key to encrypt

      // 5. response data1, data2 with above api spec
      return {
        successful: true,
        data: { data1: encryptedAesKey, data2: encryptedPayload },
      };
    } catch (error) {
      return { successful: false, error_code: 'Encryption failed.' };
    }
  }

  getDecryptedData(data: any): {
    successful: boolean;
    error_code?: string;
    data?: { payload: string };
  } {
    try {
      const { data1, data2 } = data;

      // 1. Validate request data nonnull
      if (data) {
        return { successful: false, error_code: 'Payload not found.' };
      }

      // 3. Get Payload, Decrypt data2 with AES key from step2
      const aesKey = this.decryptWithRSA(data1, this.privateKey); // using private key to decrypt

      // 2. Get AES Key, Decrypt data1 with public key
      const payload = this.decryptWithAES(data2, aesKey);

      // 4. response payload
      return { successful: true, data: { payload } };
    } catch (error) {
      return { successful: false, error_code: 'Decryption failed.' };
    }
  }
}
