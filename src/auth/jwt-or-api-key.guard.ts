import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class JwtOrApiKeyGuard extends AuthGuard('jwt') {
    constructor(private readonly apiKeysService: ApiKeysService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (apiKey) {
            const keyEntity = await this.apiKeysService.validateKey(apiKey);
            if (keyEntity) {
                request.user = keyEntity.user;
                request.permissions = keyEntity.permissions;
                request.isApiKey = true;
                return true;
            }
            // If API key is present but invalid, throw error? Or try JWT?
            // Usually if specific auth method is attempted and fails, we fail.
            throw new UnauthorizedException('Invalid API Key');
        }

        // Fallback to JWT
        try {
            return (await super.canActivate(context)) as boolean;
        } catch (err) {
            throw new UnauthorizedException('Unauthorized: No valid API Key or JWT found');
        }
    }
}
