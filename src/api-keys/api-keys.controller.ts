import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';

@Controller('keys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) { }

    @Post('create')
    async create(@Req() req, @Body() body: { name: string; permissions: string[]; expiry: string }) {
        return this.apiKeysService.create(req.user, body.name, body.permissions, body.expiry);
    }

    @Post('rollover')
    async rollover(@Req() req, @Body() body: { expired_key: string; expiry: string }) {
        return this.apiKeysService.rollover(req.user, body.expired_key, body.expiry);
    }
}
