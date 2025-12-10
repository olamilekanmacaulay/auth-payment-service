import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
    @ApiProperty({ example: 500000, description: 'The amount to deposit in Kobo (e.g., 500000 = 5000 NGN)' })
    amount: number;
}
