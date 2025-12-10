import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private walletRepository: Repository<Wallet>,
    ) { }

    async create(user: User): Promise<Wallet> {
        const walletNumber = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 digits
        const wallet = this.walletRepository.create({
            user,
            balance: 0,
            currency: 'NGN',
            walletNumber,
        });
        return this.walletRepository.save(wallet);
    }

    async getBalance(userId: string): Promise<Wallet> {
        const wallet = await this.walletRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        // Lazy generation of wallet number for existing wallets
        if (!wallet.walletNumber) {
            wallet.walletNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
            await this.walletRepository.save(wallet);
        }

        return wallet;
    }

    async findOneByUserId(userId: string): Promise<Wallet | null> {
        return this.walletRepository.findOne({ where: { user: { id: userId } } });
    }

    async creditWallet(reference: string, amount: number, userId?: string): Promise<void> {
        const existingTransaction = await this.walletRepository.manager.findOne(Transaction, {
            where: { reference },
        });

        if (existingTransaction) {
            return; // Idempotency: Transaction already processed
        }

        if (!userId) {
            throw new HttpException('User ID missing in transaction metadata', HttpStatus.BAD_REQUEST);
        }

        const wallet = await this.findOneByUserId(userId);
        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        wallet.balance = Number(wallet.balance) + Number(amount);
        await this.walletRepository.save(wallet);

        // Create transaction record
        const transaction = this.walletRepository.manager.create(Transaction, {
            wallet,
            amount,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.SUCCESS,
            reference,
            description: 'Paystack Deposit',
        });
        await this.walletRepository.manager.save(transaction);
    }

    async transfer(fromUserId: string, toWalletNumber: string, amount: number): Promise<void> {
        const queryRunner = this.walletRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const fromWallet = await queryRunner.manager.findOne(Wallet, {
                where: { user: { id: fromUserId } },
                lock: { mode: 'pessimistic_write' }, // Lock row to prevent race conditions
            });

            if (!fromWallet) {
                throw new HttpException('Sender wallet not found', HttpStatus.NOT_FOUND);
            }

            if (Number(fromWallet.balance) < amount) {
                throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
            }

            const toWallet = await queryRunner.manager.findOne(Wallet, {
                where: { walletNumber: toWalletNumber },
                lock: { mode: 'pessimistic_write' },
            });

            if (!toWallet) {
                throw new HttpException('Recipient wallet not found', HttpStatus.NOT_FOUND);
            }

            // Deduct from sender
            fromWallet.balance = Number(fromWallet.balance) - Number(amount);
            await queryRunner.manager.save(fromWallet);

            // Credit recipient
            toWallet.balance = Number(toWallet.balance) + Number(amount);
            await queryRunner.manager.save(toWallet);

            // Create Transaction Records (Sender - Debit)
            const debitTx = queryRunner.manager.create(Transaction, {
                wallet: fromWallet,
                amount: -amount, // Negative for debit
                type: TransactionType.TRANSFER,
                status: TransactionStatus.SUCCESS,
                description: `Transfer to wallet ${toWallet.id}`,
                reference: `TRF-${Date.now()}-${fromWallet.id.slice(0, 4)}`,
            });
            await queryRunner.manager.save(debitTx);

            // Create Transaction Records (Recipient - Credit)
            const creditTx = queryRunner.manager.create(Transaction, {
                wallet: toWallet,
                amount: amount,
                type: TransactionType.TRANSFER,
                status: TransactionStatus.SUCCESS,
                description: `Transfer from wallet ${fromWallet.id}`,
                reference: `TRF-${Date.now()}-${fromWallet.id.slice(0, 4)}`,
            });
            await queryRunner.manager.save(creditTx);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getTransactions(userId: string): Promise<Transaction[]> {
        return this.walletRepository.manager.find(Transaction, {
            where: { wallet: { user: { id: userId } } },
            order: { createdAt: 'DESC' },
        });
    }

    async getDepositStatus(reference: string): Promise<any> {
        const transaction = await this.walletRepository.manager.findOne(Transaction, {
            where: { reference, type: TransactionType.DEPOSIT },
        });

        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }

        return {
            reference: transaction.reference,
            status: transaction.status,
            amount: transaction.amount,
        };
    }
}
