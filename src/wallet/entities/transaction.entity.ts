import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

export enum TransactionType {
    DEPOSIT = 'deposit',
    TRANSFER = 'transfer',
}

export enum TransactionStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
    status: TransactionStatus;

    @Column({ nullable: true })
    reference: string; // Paystack reference or internal transfer ref

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Wallet, (wallet) => wallet.id)
    wallet: Wallet;

    @CreateDateColumn()
    createdAt: Date;
}
