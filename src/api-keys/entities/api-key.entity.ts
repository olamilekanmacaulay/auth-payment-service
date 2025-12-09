import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('api_keys')
export class ApiKey {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string; // Hashed key

    @Column('simple-array')
    permissions: string[];

    @Column()
    expiresAt: Date;

    @ManyToOne(() => User, (user) => user.apiKeys)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
