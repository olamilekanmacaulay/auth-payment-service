import { Controller, Get, Post, Body, UseGuards, Req, UnauthorizedException, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtOrApiKeyGuard } from '../auth/jwt-or-api-key.guard';
import { PaystackService } from '../paystack/paystack.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';

/**
 * Controller for handling wallet operations.
 * Supports both JWT and API Key authentication.
 */
@ApiTags('Wallet')
@ApiBearerAuth()
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
     */
    @ApiOperation({ summary: 'Get wallet balance', description: 'Retrieves the balance and details of the user\'s wallet.' })
    @ApiResponse({ status: 200, description: 'Wallet details retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized or missing permissions.' })
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
     */
    @ApiOperation({ summary: 'Initialize deposit', description: 'Generates a Paystack payment link for funding the wallet.' })
    @ApiBody({ type: DepositDto })
    @ApiResponse({ status: 201, description: 'Transaction initialized successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized or missing permissions.' })
    @Post('deposit')
    async deposit(@Req() req, @Body() body: DepositDto) {
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
     */
    @ApiOperation({ summary: 'Transfer funds', description: 'Transfers money to another user via their wallet number.' })
    @ApiBody({ type: TransferDto })
    @ApiResponse({ status: 201, description: 'Transfer completed successfully.' })
    @ApiResponse({ status: 400, description: 'Insufficient balance or invalid recipient.' })
    @ApiResponse({ status: 401, description: 'Unauthorized or missing permissions.' })
    @Post('transfer')
    async transfer(@Req() req, @Body() body: TransferDto) {
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
     */
    @ApiOperation({ summary: 'Get transaction history', description: 'Retrieves a list of all transactions for the wallet.' })
    @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized or missing permissions.' })
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
     */
    @ApiOperation({ summary: 'Get deposit status', description: 'Checks the status of a specific deposit by reference.' })
    @ApiParam({ name: 'reference', description: 'The transaction reference' })
    @ApiResponse({ status: 200, description: 'Transaction status retrieved successfully.' })
    @ApiResponse({ status: 404, description: 'Transaction not found.' })
    @Get('deposit/:reference/status')
    async getDepositStatus(@Req() req, @Param('reference') reference: string) {
        if (req.isApiKey && !req.permissions.includes('read')) {
            throw new UnauthorizedException('Missing read permission');
        }
        return this.walletService.getDepositStatus(reference);
    }
}
