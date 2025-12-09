import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtOrApiKeyGuard } from '../auth/jwt-or-api-key.guard';
import { PaystackService } from '../paystack/paystack.service';

@Controller('wallet')
// We need a custom guard to allow EITHER JWT OR API Key
// For simplicity, let's apply them on specific routes or create a composite guard
// But NestJS guards run in order. If one returns true, does it stop? No, all must return true if global?
// If we use @UseGuards(Guard1, Guard2), both must pass? No.
// We need a strategy that tries one, then the other.
// Or we can make a custom guard that checks both.
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
        const result = await this.paystackService.initializeTransaction(user.email, body.amount);
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
