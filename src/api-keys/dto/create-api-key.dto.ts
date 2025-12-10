import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyDto {
    @ApiProperty({ example: 'My Service Key', description: 'A descriptive name for the API key' })
    name: string;

    @ApiProperty({ example: ['read', 'deposit'], description: 'List of permissions for the key' })
    permissions: string[];

    @ApiProperty({ example: '1M', description: 'Expiry duration (e.g., 1H, 1D, 1M, 1Y)' })
    expiry: string;
}
