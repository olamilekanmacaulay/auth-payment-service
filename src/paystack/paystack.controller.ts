import { Controller, Post, Body, Headers, HttpException, HttpStatus, Req } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { WalletService } from '../wallet/wallet.service';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';

/**
 * Controller for handling Paystack-related operations.
 */
@ApiTags('Paystack')
@Controller('wallet/paystack')
export class PaystackController {
    constructor(
        private readonly paystackService: PaystackService,
        private readonly walletService: WalletService,
    ) { }

    /**
     * Webhook endpoint for Paystack events.
     * Verifies the signature and processes successful charge events to credit wallets.
     */
    @ApiOperation({ summary: 'Paystack Webhook', description: 'Receives and processes Paystack events.' })
    @ApiHeader({ name: 'x-paystack-signature', description: 'HMAC SHA512 signature' })
    @ApiBody({ schema: { type: 'object' }, description: 'Paystack event payload' })
    @ApiResponse({ status: 201, description: 'Webhook processed successfully.' })
    @Post('webhook')
    async handleWebhook(
        @Headers('x-paystack-signature') signature: string,
        @Body() body: any,
        @Req() req: any, // Using any to avoid type issues with RawBodyRequest for now
    ) {
        // Use rawBody if available, otherwise fallback (though rawBody is preferred)
        const payload = req.rawBody || JSON.stringify(body);

        if (!this.paystackService.verifySignature(signature, payload)) {
            throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
        }

        const { event, data } = body;

        if (event === 'charge.success') {
            await this.walletService.creditWallet(data.reference, data.amount / 100, data.metadata?.userId); // Amount comes in kobo
        }

        return { status: true };
    }
}
