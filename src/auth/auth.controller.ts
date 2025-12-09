import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

/**
 * Controller for handling authentication via Google OAuth.
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Initiates the Google OAuth2 login flow.
     * Redirects the user to the Google login page.
     * @route GET /auth/google
     */
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        // Initiates the Google OAuth2 login flow
    }

    /**
     * Callback endpoint for Google OAuth2.
     * Handles the redirect from Google after successful login.
     * Validates the user and returns a JWT token.
     * @route GET /auth/google/callback
     * @returns {Object} JSON object containing the JWT access token.
     */
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        const user = await this.authService.validateUser(req.user);
        return this.authService.login(user);
    }
}
