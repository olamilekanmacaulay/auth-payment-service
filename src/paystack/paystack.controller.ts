import { Controller, Post, Body, Headers, HttpException, HttpStatus, Req } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { WalletService } from '../wallet/wallet.service';

@Controller('wallet/paystack')
export class PaystackController {
    constructor(
        private readonly paystackService: PaystackService,
        private readonly walletService: WalletService,
    ) { }

    @Post('webhook')
    async handleWebhook(
        @Headers('x-paystack-signature') signature: string,
        @Body() body: any,
        @Req() req: any, // Using any to avoid type issues with RawBodyRequest for now
    ) {
        // Use rawBody if available, otherwise fallback (though rawBody is preferred)
        const payload = req.rawBody || JSON.stringify(body);

        console.log('--- Debug Webhook ---');
        console.log('Header Signature:', signature);
        console.log('RawBody Type:', typeof req.rawBody);
        console.log('Payload used for hash:', payload.toString());

        const isValid = this.paystackService.verifySignature(signature, payload);
        
        // DEBUG: Calculate hash here to show in logs
        const crypto = require('crypto');
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const calculatedHash = crypto.createHmac('sha512', secret).update(payload).digest('hex');
        console.log('Calculated Hash:', calculatedHash);
        console.log('Is Valid:', isValid);

        if (!isValid) {
            throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
        }

        const { event, data } = body;

        if (event === 'charge.success') {
            await this.walletService.creditWallet(data.reference, data.amount / 100, data.metadata?.userId); // Amount comes in kobo
        }

        return { status: true };
    }
}
