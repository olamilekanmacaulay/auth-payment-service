import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';
import { WalletModule } from '../wallet/wallet.module';

import { forwardRef } from '@nestjs/common';

@Module({
    imports: [forwardRef(() => WalletModule)],
    controllers: [PaystackController],
    providers: [PaystackService],
    exports: [PaystackService],
})
export class PaystackModule { }
