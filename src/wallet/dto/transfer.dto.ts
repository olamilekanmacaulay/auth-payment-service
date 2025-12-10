import { ApiProperty } from '@nestjs/swagger';

export class TransferDto {
    @ApiProperty({ example: '123456789', description: 'The 9-digit wallet number of the recipient' })
    wallet_number: string;

    @ApiProperty({ example: 300000, description: 'The amount to transfer in Kobo' })
    amount: number;
}
