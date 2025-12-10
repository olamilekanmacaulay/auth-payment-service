import { ApiProperty } from '@nestjs/swagger';

export class RolloverApiKeyDto {
    @ApiProperty({ example: 'mac_ws_...', description: 'The expired API key to rollover' })
    expired_key: string;

    @ApiProperty({ example: '1M', description: 'New expiry duration (e.g., 1H, 1D, 1M, 1Y)' })
    expiry: string;
}
