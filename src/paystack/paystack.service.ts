import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaystackService {
    private readonly secretKey: string;

    constructor(private configService: ConfigService) {
        this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY')!;
    }

    async initializeTransaction(email: string, amount: number, userId: string) {
        try {
            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount: amount * 100,
                    metadata: {
                        userId,
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return response.data.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data?.message || 'Paystack initialization failed',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    verifySignature(signature: string, body: string | Buffer): boolean {
        const hash = crypto
            .createHmac('sha512', this.secretKey)
            .update(body)
            .digest('hex');
        return hash === signature;
    }

    async verifyTransaction(reference: string) {
        try {
            const response = await axios.get(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                    },
                },
            );
            return response.data.data;
        } catch (error) {
            throw new HttpException(
                error.response?.data?.message || 'Paystack verification failed',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
