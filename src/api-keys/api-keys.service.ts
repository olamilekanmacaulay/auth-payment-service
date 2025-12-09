import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ApiKeysService {
    constructor(
        @InjectRepository(ApiKey)
        private apiKeysRepository: Repository<ApiKey>,
    ) { }

    async create(user: User, name: string, permissions: string[], expiry: string) {
        // Check limit of active keys
        const count = await this.apiKeysRepository.count({
            where: {
                user: { id: user.id },
                expiresAt: MoreThan(new Date()),
            }
        });
        if (count >= 5) {
            throw new HttpException('Maximum of 5 active API keys allowed', HttpStatus.BAD_REQUEST);
        }

        const key = `mac_ws_${crypto.randomBytes(24).toString('hex')}`;
        const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
        const expiresAt = this.calculateExpiry(expiry);

        const apiKey = this.apiKeysRepository.create({
            key: hashedKey,
            permissions,
            expiresAt,
            user,
        });

        await this.apiKeysRepository.save(apiKey);

        return { api_key: key, expires_at: expiresAt };
    }

    async rollover(user: User, expiredKey: string, expiry: string) {
        if (!expiredKey) {
            throw new HttpException('expired_key is required', HttpStatus.BAD_REQUEST);
        }
        const hash = crypto.createHash('sha256').update(expiredKey).digest('hex');
        const oldKey = await this.apiKeysRepository.findOne({ where: { key: hash, user: { id: user.id } } });
        if (!oldKey) {
            throw new HttpException('Key not found', HttpStatus.NOT_FOUND);
        }

        if (new Date() < oldKey.expiresAt) {
            throw new HttpException('Key is not yet expired', HttpStatus.BAD_REQUEST);
        }

        // Create new key with same permissions
        return this.create(user, 'Rollover Key', oldKey.permissions, expiry);
    }

    async validateKey(key: string): Promise<ApiKey | null> {
        // We use SHA256 to hash the key for storage and lookup.
        const hash = crypto.createHash('sha256').update(key).digest('hex');
        const apiKey = await this.apiKeysRepository.findOne({ where: { key: hash }, relations: ['user'] });

        if (apiKey && apiKey.expiresAt > new Date()) {
            return apiKey;
        }
        return null;
    }

    private calculateExpiry(expiry: string): Date {
        const date = new Date();
        const amount = parseInt(expiry.slice(0, -1));
        const unit = expiry.slice(-1);

        switch (unit) {
            case 'H': date.setHours(date.getHours() + amount); break;
            case 'D': date.setDate(date.getDate() + amount); break;
            case 'M': date.setMonth(date.getMonth() + amount); break;
            case 'Y': date.setFullYear(date.getFullYear() + amount); break;
            default: throw new HttpException('Invalid expiry format', HttpStatus.BAD_REQUEST);
        }
        return date;
    }
}
