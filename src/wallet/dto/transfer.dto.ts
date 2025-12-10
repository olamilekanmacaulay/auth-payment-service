import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
    @ApiProperty({ example: '123456789', description: 'The 9-digit wallet number of the recipient' })
    wallet_number: string;

    @ApiProperty({ example: 3000, description: 'The amount to transfer in NGN' })
    amount: number;
}
