import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    balance: number;

    @Column({ unique: true, nullable: true })
    walletNumber: string;

    @Column({ default: 'NGN' })
    currency: string;

    @ManyToOne(() => User, (user) => user.wallets)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
