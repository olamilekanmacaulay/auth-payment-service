import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for handling authentication via Google OAuth.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Initiates the Google OAuth2 login flow.
     * Redirects the user to the Google login page.
     */
    @ApiOperation({ summary: 'Google Login', description: 'Redirects to Google for authentication.' })
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        // Initiates the Google OAuth2 login flow
    }

    /**
     * Callback endpoint for Google OAuth2.
     * Handles the redirect from Google after successful login.
     * Validates the user and returns a JWT token.
     */
    @ApiOperation({ summary: 'Google Callback', description: 'Handles Google redirect and returns JWT.' })
    @ApiResponse({ status: 200, description: 'User logged in successfully.' })
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        const user = await this.authService.validateUser(req.user);
        return this.authService.login(user);
    }
}
