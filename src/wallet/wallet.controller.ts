import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtOrApiKeyGuard } from '../auth/jwt-or-api-key.guard';
import { PaystackService } from '../paystack/paystack.service';

@Controller('wallet')
@UseGuards(JwtOrApiKeyGuard)
export class WalletController {
    constructor(
        private readonly walletService: WalletService,
        private readonly paystackService: PaystackService,
    ) { }

    @Get('balance')
    async getBalance(@Req() req) {
        if (req.isApiKey && !req.permissions.includes('read')) {
            throw new UnauthorizedException('Missing read permission');
        }
        return this.walletService.getBalance(req.user.userId || req.user.id);
    }

    @Post('deposit')
    async deposit(@Req() req, @Body() body: { amount: number }) {
        if (req.isApiKey && !req.permissions.includes('deposit')) {
            throw new UnauthorizedException('Missing deposit permission');
        }
        const user = req.user;
        const result = await this.paystackService.initializeTransaction(user.email, body.amount, user.userId || user.id);
        return result;
    }

    @Post('transfer')
    async transfer(@Req() req, @Body() body: { wallet_number: string; amount: number }) {
        // Assuming wallet_number is the wallet ID for simplicity, or we can look it up
        // Check permissions if API Key
        if (req.isApiKey && !req.permissions.includes('transfer')) {
            throw new UnauthorizedException('Missing transfer permission');
        }
        await this.walletService.transfer(req.user.id, body.wallet_number, body.amount);
        return { message: 'Transfer successful' };
    }

    @Get('transactions')
    async getTransactions(@Req() req) {
        if (req.isApiKey && !req.permissions.includes('read')) {
            throw new UnauthorizedException('Missing read permission');
        }
        return this.walletService.getTransactions(req.user.userId || req.user.id);
    }

    @Get('deposit/:reference/status')
    async getDepositStatus(@Req() req, @Param('reference') reference: string) {
        if (req.isApiKey && !req.permissions.includes('read')) {
            throw new UnauthorizedException('Missing read permission');
        }
        return this.walletService.getDepositStatus(reference);
    }
}
