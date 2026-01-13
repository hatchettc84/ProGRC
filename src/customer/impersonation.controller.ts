import { BadRequestException, Body, Controller, Delete, Post, Req, Res, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorators/roles.decorator";
import { AuthGuard } from "src/guards/authGuard";
import { TransformInterceptor } from "src/interceptors/transform.interceptor";
import { UserRole } from "src/masterData/userRoles.entity";
import { ImpersonateService } from "./service/impersonate.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { StandardResponse } from "src/common/dto/standardResponse.dto";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { userInfo } from "os";
import { LoggerService } from "src/logger/logger.service";

@Controller('impersonations')
@ApiTags('Impersonation')
@UseInterceptors(TransformInterceptor)
export class ImpersonationController {
    constructor(
        private readonly impersonateSrvc: ImpersonateService,
        private readonly configService: ConfigService,
        private readonly logger: LoggerService
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM, UserRole.SuperAdmin)
    @ApiResponse({
        status: 200, description: 'Emulation started successfully.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                customer_id: { type: 'string' }
            },
            required: ['customer_id'],
        }
    })
    async startEmulation(
        @Req() req: any,
        @Body('customer_id') id: string,
        @Res() res: Response
    ){
        if (!id) {
            throw new BadRequestException('Customer ID is required');
        }
        
        this.logger.log(`startEmulation: Starting impersonation for customer ${id}`, {
            userId: req['user_data']?.userId,
            email: req['user_data']?.email,
            role_id: req['user_data']?.role_id
        });
        
        // CRITICAL: Clear old cookies first to ensure new impersonation tokens are used
        // This prevents the guard from using old tokens from cookies
        res.clearCookie('accessToken', { path: '/', httpOnly: true });
        res.clearCookie('refreshToken', { path: '/', httpOnly: true });
        res.clearCookie('preAuthToken', { path: '/', httpOnly: true });
        
        const { accessToken, refreshToken } = await this.impersonateSrvc.impersonateCustomer(
            req['user_data'],
            id
        );
        
        // Decode and log the new token payload to verify it has tenant_id/customerId
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(accessToken);
            this.logger.log(`startEmulation: Generated impersonation tokens`, {
                customerId: decoded?.customerId,
                tenant_id: decoded?.tenant_id,
                hasImpersonateExpTime: !!decoded?.impersonateExpTime,
                userId: decoded?.userId,
                email: decoded?.email
            });
        } catch (e) {
            this.logger.warn(`startEmulation: Could not decode token for logging`, e);
        }
        
        this.setAuthCookies(res, accessToken, refreshToken);
        
        // Return tokens in response so frontend can update localStorage
        // This is CRITICAL - frontend must use these tokens for subsequent requests
        return res.json(StandardResponse.success("Successfully logged in", {
            accessToken: accessToken,
            refreshToken: refreshToken
        }));

        //return new StandardResponse('201', 'Emulation started successfully.', token);
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM, UserRole.SuperAdmin)
    @ApiResponse({
        status: 200, description: 'Emulation stopped successfully.',
    })
    async stopEmulation(
        @Req() req: any,
        @Res() res: Response
    ) {
        // Clear impersonation cookies first
        res.clearCookie('accessToken', { path: '/', httpOnly: true });
        res.clearCookie('refreshToken', { path: '/', httpOnly: true });
        
        const { accessToken, refreshToken } = await this.impersonateSrvc.stopImpersonating(
            req['user_data']
        );
        this.setAuthCookies(res, accessToken, refreshToken);
        return res.json(StandardResponse.success("Emulation stopped successfully.", {accessToken: accessToken, refreshToken: refreshToken}));

       // return new StandardResponse('201', 'Emulation stopped successfully.', token);
    }

    @Post("/auditor")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM, UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.SuperAdmin)
    @ApiResponse({
        status: 200, description: 'Emulation started successfully.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                customer_id: { type: 'string' }
            },
            required: ['customer_id'],
        }
    })
    async startAuditorEmulation(
        @Req() req: any,
        @Body('customer_id') id: string,
        @Res() res: Response
    ){
        if (!id) {
            throw new BadRequestException('Customer ID is required');
        }
        
        // Clear old cookies first
        res.clearCookie('accessToken', { path: '/', httpOnly: true });
        res.clearCookie('refreshToken', { path: '/', httpOnly: true });
        res.clearCookie('preAuthToken', { path: '/', httpOnly: true });
        
       const { accessToken, refreshToken } = await this.impersonateSrvc.impersonateCustomer(
            req['user_data'],
            id
        );
        this.setAuthCookies(res, accessToken, refreshToken);
        return res.json(StandardResponse.success("Successfully Emulated auditor", {accessToken: accessToken, refreshToken: refreshToken}));

    }

    @Delete("/auditor")
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.CSM, UserRole.AUDITOR, UserRole.CSM_AUDITOR, UserRole.SuperAdmin)
    @ApiResponse({
        status: 200, description: 'Emulation stopped successfully.',
    })
    async stopAuditorEmulation(
        @Req() req: any,
        @Res() res: Response
    ) {
        // Clear impersonation cookies first
        res.clearCookie('accessToken', { path: '/', httpOnly: true });
        res.clearCookie('refreshToken', { path: '/', httpOnly: true });
        
        const { accessToken, refreshToken } = await this.impersonateSrvc.stopImpersonating(
            req['user_data']
        );
        this.setAuthCookies(res, accessToken, refreshToken);
        return res.json(StandardResponse.success("Emulation stopped successfully.", {accessToken: accessToken, refreshToken: refreshToken}));

       // return new StandardResponse('201', 'Emulation stopped successfully.', token);
    }

    private setAuthCookies(res: Response<any, Record<string, any>>, accessToken: string, refreshToken: string) {
        // For HTTP (non-HTTPS) environments, we need to adjust cookie settings
        const isHttps = process.env.ENVIRONMENT === 'production' || process.env.ENVIRONMENT === 'prod';
        const cookieOptions: any = {
            httpOnly: true,
            path: '/',
            secure: isHttps, // Only secure for HTTPS
            maxAge: 4 * 60 * 60 * 1000, // 4 hours
        };

        // For HTTP environments (like VPS), use 'lax' instead of 'strict' or 'none'
        // This allows cookies to work properly with HTTP
        if (isHttps) {
            cookieOptions['sameSite'] = 'strict';
        } else {
            // For HTTP, use 'lax' to allow cookies to be sent
            cookieOptions['sameSite'] = 'lax';
        }

        res.cookie('accessToken', accessToken, cookieOptions);
        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }


}
