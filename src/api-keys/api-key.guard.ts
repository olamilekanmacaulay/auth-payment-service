import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly apiKeysService: ApiKeysService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            return false; // Let other guards handle it or fail if this is the only one
        }

        const keyEntity = await this.apiKeysService.validateKey(apiKey);
        if (!keyEntity) {
            throw new UnauthorizedException('Invalid API Key');
        }

        // Attach user and permissions to request
        request.user = keyEntity.user;
        request.permissions = keyEntity.permissions;
        request.isApiKey = true;

        return true;
    }
}
