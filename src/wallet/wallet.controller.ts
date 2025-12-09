import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtOrApiKeyGuard } from '../auth/jwt-or-api-key.guard';
import { PaystackService } from '../paystack/paystack.service';

/**
 * Controller for handling wallet operations.
 * Supports both JWT and API Key authentication.
 */
@Controller('wallet')
@UseGuards(JwtOrApiKeyGuard)
export class WalletController {
    constructor(
        private readonly walletService: WalletService,
        private readonly paystackService: PaystackService,
    ) { }

    /**
     * Retrieves the balance of the authenticated user's wallet.
     * Requires 'read' permission if using API Key.
     * @route GET /wallet/balance
     * @returns {Object} JSON object containing the wallet details and balance.
     */
    @Get('balance')
    async getBalance(@Req() req) {
        if (req.isApiKey && !req.permissions.includes('read')) {
            throw new UnauthorizedException('Missing read permission');
        }
        return this.walletService.getBalance(req.user.userId || req.user.id);
    }

    /**
     * Initiates a deposit transaction via Paystack.
     * Requires 'deposit' permission if using API Key.
     * @route POST /wallet/deposit
     * @param {Object} body - Request body containing the amount.
     * @param {number} body.amount - The amount to deposit (in NGN).
     * @returns {Object} JSON object containing the Paystack authorization URL and reference.
     */
    @Post('deposit')
    async deposit(@Req() req, @Body() body: { amount: number }) {
        if (req.isApiKey && !req.permissions.includes('deposit')) {
            throw new UnauthorizedException('Missing deposit permission');
        }
        const user = req.user;
        const result = await this.paystackService.initializeTransaction(user.email, body.amount, user.userId || user.id);
        return result;
    }

    /**
     * Transfers funds from the authenticated user's wallet to another wallet.
     * Requires 'transfer' permission if using API Key.
     * @route POST /wallet/transfer
     * @param {Object} body - Request body containing recipient wallet number and amount.
     * @param {string} body.wallet_number - The 9-digit wallet number of the recipient.
     * @param {number} body.amount - The amount to transfer.
     * @returns {Object} JSON object confirming the transfer.
     */
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

    /**
     * Retrieves the transaction history of the authenticated user's wallet.
     * Requires 'read' permission if using API Key.
     * @route GET /wallet/transactions
     * @returns {Array} List of transaction objects.
     */
    @Get('transactions')
    async getTransactions(@Req() req) {
        if (req.isApiKey && !req.permissions.includes('read')) {
            throw new UnauthorizedException('Missing read permission');
        }
        return this.walletService.getTransactions(req.user.userId || req.user.id);
    }

    /**
     * Checks the status of a specific deposit transaction.
     * Requires 'read' permission if using API Key.
     * @route GET /wallet/deposit/:reference/status
     * @param {string} reference - The transaction reference.
     * @returns {Object} JSON object containing the transaction status and amount.
     */
    @Get('deposit/:reference/status')
    async getDepositStatus(@Req() req, @Param('reference') reference: string) {
        if (req.isApiKey && !req.permissions.includes('read')) {
            throw new UnauthorizedException('Missing read permission');
        }
        return this.walletService.getDepositStatus(reference);
    }
}
