import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(details: any): Promise<User> {
        const { email, googleId, firstName, lastName, picture } = details;
        let user = await this.usersService.findByEmail(email);

        if (!user) {
            user = await this.usersService.create({
                email,
                googleId,
                firstName,
                lastName,
                avatarUrl: picture,
            });
        } else if (!user.googleId) {
            // Link google account if user exists but no googleId
            user = await this.usersService.update(user.id, {
                googleId,
                avatarUrl: user.avatarUrl || picture, // Update avatar if missing
            });
        }
        return user;
    }

    async login(user: User) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}
