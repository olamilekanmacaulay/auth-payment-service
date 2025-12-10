import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { RolloverApiKeyDto } from './dto/rollover-api-key.dto';

/**
 * Controller for managing API Keys.
 * Requires JWT authentication.
 */
@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('keys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) { }

    /**
     * Creates a new API Key for the authenticated user.
     */
    @ApiOperation({ summary: 'Create API Key', description: 'Generates a new API Key with specified permissions.' })
    @ApiBody({ type: CreateApiKeyDto })
    @ApiResponse({ status: 201, description: 'API Key created successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input or limit reached.' })
    @Post('create')
    async create(@Req() req, @Body() body: CreateApiKeyDto) {
        return this.apiKeysService.create(req.user, body.name, body.permissions, body.expiry);
    }

    /**
     * Rollover (regenerate) an expired API Key.
     * Creates a new key with the same permissions as the expired one.
     */
    @ApiOperation({ summary: 'Rollover API Key', description: 'Replaces an expired API Key with a new one, retaining permissions.' })
    @ApiBody({ type: RolloverApiKeyDto })
    @ApiResponse({ status: 201, description: 'API Key rolled over successfully.' })
    @ApiResponse({ status: 400, description: 'Key not expired or invalid.' })
    @Post('rollover')
    async rollover(@Req() req, @Body() body: RolloverApiKeyDto) {
        return this.apiKeysService.rollover(req.user, body.expired_key, body.expiry);
    }
}
