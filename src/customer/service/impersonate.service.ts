import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { User } from "src/entities/user.entity";
import { UserRole } from "src/masterData/userRoles.entity";
import { Repository } from "typeorm";

@Injectable()
export class ImpersonateService {
    private impersonateTimeoutSeconds: number;
    constructor(
        private readonly cognitoService: CognitoService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        @InjectRepository(CustomerCsm) private readonly customerCsmRepository: Repository<CustomerCsm>,
    ) {
        this.impersonateTimeoutSeconds = this.configService.get("IMPERSONATE_TIMEOUT_SECONDS");
    }

    async impersonateCustomer(userInfo: any, customerId: string): Promise<{ accessToken: string, refreshToken: string }> {
        const userId = userInfo['userId'];
        const role_id = userInfo['role_id'];

        // Super Admins can impersonate any customer without being assigned as CSM
        const isSuperAdmin = role_id === UserRole.SuperAdmin;

        if (!isSuperAdmin) {
            const assignedCsm: CustomerCsm = await this.customerCsmRepository.findOne({
                where: {
                    user_id: userInfo.userId,
                    customer_id: customerId,
                    role_id: role_id,
                }
            });
            if (!assignedCsm) {
                throw new BadRequestException('Only assigned CSM can impersonate customer');
            }
        }

        const payload = {
            sub: userInfo.email,
            userId: userInfo.userId,
            role_id: userInfo.role_id,
            email: userInfo.email,
            mfa_enabled: userInfo.mfa_enabled,
        }

        payload['customerId'] = customerId;
        payload['tenant_id'] = customerId;
        payload['impersonateExpTime'] = new Date(Date.now() + (this.impersonateTimeoutSeconds * 1000)).toISOString();

        const token = this.jwtService.sign(payload, {
            privateKey: this.configService.get("ACCESS_TOKEN_SIGNATURE_PRIVATE"),
            algorithm: "RS256",
            expiresIn: "4h",
            audience: 'progrc-auth',
            issuer: 'progrc-auth',
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get("REFRESH_TOKEN_SIGNATURE"),
            algorithm: "HS256",
            expiresIn: this.impersonateTimeoutSeconds,
            audience: 'progrc-auth-refresh',
            issuer: 'progrc-auth',
        });

        return { accessToken: token, refreshToken };
    }

    async stopImpersonating(userInfo: any): Promise<{ accessToken: string, refreshToken: string }> {
        const payload = userInfo;
        payload['tenant_id'] = null;
        payload['customerId'] = null;
        payload['impersonateExpTime'] = null;
        const newPayload = {
            sub: payload.email,
            email: payload.email,
            role_id: payload.role_id,
            customerId: payload.customerId,
            tenant_id: payload.tenant_id,
            userId: payload.userId,
        };
        const token = this.jwtService.sign(newPayload, {
            privateKey: this.configService.get("ACCESS_TOKEN_SIGNATURE_PRIVATE"),
            algorithm: "RS256",
            audience: 'progrc-auth',
            issuer: 'progrc-auth',
            expiresIn: '4h',
        });

        const refreshToken = this.jwtService.sign(newPayload, {
            secret: this.configService.get("REFRESH_TOKEN_SIGNATURE"),
            algorithm: "HS256",
            audience: 'progrc-auth-refresh',
            issuer: 'progrc-auth',
            expiresIn: '7d'
        });
        return { accessToken: token, refreshToken };
    }
}
