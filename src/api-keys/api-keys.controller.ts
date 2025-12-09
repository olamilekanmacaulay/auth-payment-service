import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';

/**
 * Controller for managing API Keys.
 * Requires JWT authentication.
 */
@Controller('keys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) { }

    /**
     * Creates a new API Key for the authenticated user.
     * @route POST /keys/create
     * @param {Object} body - Request body.
     * @param {string} body.name - Name/Label for the API Key.
     * @param {string[]} body.permissions - List of permissions (e.g., ['read', 'deposit']).
     * @param {string} body.expiry - Expiry duration (e.g., '1D', '1M').
     * @returns {Object} JSON object containing the new API Key and its expiry date.
     */
    @Post('create')
    async create(@Req() req, @Body() body: { name: string; permissions: string[]; expiry: string }) {
        return this.apiKeysService.create(req.user, body.name, body.permissions, body.expiry);
    }

    /**
     * Rollover (regenerate) an expired API Key.
     * Creates a new key with the same permissions as the expired one.
     * @route POST /keys/rollover
     * @param {Object} body - Request body.
     * @param {string} body.expired_key - The expired API Key string.
     * @param {string} body.expiry - New expiry duration (e.g., '1D', '1M').
     * @returns {Object} JSON object containing the new API Key and its expiry date.
     */
    @Post('rollover')
    async rollover(@Req() req, @Body() body: { expired_key: string; expiry: string }) {
        return this.apiKeysService.rollover(req.user, body.expired_key, body.expiry);
    }
}
