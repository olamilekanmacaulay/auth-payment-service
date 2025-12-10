import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
    @ApiProperty({ example: 5000, description: 'The amount to deposit in NGN' })
    amount: number;
}
