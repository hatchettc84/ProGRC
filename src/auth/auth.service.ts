import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { readFile } from "fs/promises";
import { Jwt, decode, verify } from "jsonwebtoken";
// @ts-ignore - jwk-to-pem doesn't have type definitions
import * as jwkToPem from "jwk-to-pem";
import { InviteStatus, User } from "src/entities/user.entity";
import { DataSource, EntityManager, Repository } from "typeorm";
import { NewAdminInviteEmail } from "src/notifications/templates/progrc-email";
import { Customer } from "src/entities/customer.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { UserRole } from "src/masterData/userRoles.entity";
import { EmailService } from "src/notifications/email.service";
import { ResetPasswordTokenService, ResetPasswordTokenType } from "src/user/services/resetPasswordToken.service";
import { CognitoService } from "./cognitoAuth.service";
import { LoggerService } from "src/logger/logger.service";
import { LicenseType } from "src/entities/lincenseType.entity";
import { PasswordHistory } from "src/entities/auth/passwordHistory.entity";
import { RefreshToken } from "src/entities/auth/refreshToken.entity";
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sign } from "jsonwebtoken";
import { SignUpDto } from './dto/auth.dto';
interface DecodedJwt extends Jwt {
  payload: {
    aud: string;
    iss: string;
  };
}

interface CognitoJwtInterface {
  sub: string;
  aud: string;
  email_verified: boolean;
  event_id: string;
  token_use: string;
  auth_time: number;
  "custom:tenant_id": string;
  iss: string;
  name: string;
  "cognito:username": string;
  exp: number;
  iat: number;
  email: string;
}

const Total_Reserved_Org_Id = 50000;

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private cognitoSvc: CognitoService,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(LicenseType) private licenseTypeRepo: Repository<LicenseType>,
    @InjectRepository(PasswordHistory) private passwordHistoryRepo: Repository<PasswordHistory>,
    @InjectRepository(RefreshToken) private refreshTokenRepo: Repository<RefreshToken>,
    private readonly dataSouce: DataSource,
    private readonly emailService: EmailService,
    private readonly resetPasswordTokenSrvc: ResetPasswordTokenService,
    private readonly logger: LoggerService
  ) { }

  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly PASSWORD_HISTORY_SIZE = 3;

  async createOrg(org_id: string, org_name: string, created_by: string, lisence_type?: string) {
    const orgToCreate = this.customerRepo.create({
      organization_name: org_name || "N/A",
      created_by: created_by,
      license_type: lisence_type || "Beta",
    });
    if (org_id !== '') {
      orgToCreate.id = org_id;
    }
    return await this.customerRepo.save(orgToCreate);
  }

  async createOrgUser(body: any, created_by: string) {
    let { org_id, org_name, email, role, role_id, name, create_new_org, license_type_id, license_start_date, license_end_date } = body;
    try {
      let user: User;
      let customer: Customer;
      let licenseType: LicenseType;
      if (create_new_org) {
        if (!license_type_id) {
          throw new BadRequestException({
            error: "License Type is required",
            message: "License Type is required",
          });
        } else {
          licenseType = await this.licenseTypeRepo.findOne({ where: { id: license_type_id } });
          if (!licenseType) {
            throw new BadRequestException({
              error: "Invalid License Type",
              message: "Invalid License Type",
            });
          }
        }
        if (!license_start_date) {
          throw new BadRequestException({
            error: "License Start Date is required",
            message: "License Start Date is required",
          });
        }

        if (isNaN(Date.parse(license_start_date))) {
          throw new BadRequestException({
            error: "Invalid License Start Date",
            message: "License Start Date must be a valid date",
          });
        }

        if (!license_end_date) {
          throw new BadRequestException({
            error: "License End Date is required",
            message: "License End Date is required",
          });
        }

        if (isNaN(Date.parse(license_end_date))) {
          throw new BadRequestException({
            error: "Invalid License End Date",
            message: "License End Date must be a valid date",
          });
        }
      }
      await this.dataSouce.transaction(async (manager) => {
        const orgCreator: User = await manager.findOneByOrFail(User, { id: created_by });
        if (org_id) {
          customer = await manager.findOne(Customer, { where: { id: org_id } });
        } else {
          customer = await this.createNewCustomer(manager, org_name, created_by, license_type_id, license_start_date, license_end_date);
        }

        if (orgCreator.role_id === UserRole.CSM) {
          await manager.createQueryBuilder()
            .insert()
            .into(CustomerCsm)
            .values({
              customer_id: customer.id,
              user_id: created_by,
              created_by: created_by,
              role_id: UserRole.CSM,
            })
            .orIgnore()
            .execute();
        }
        user = await this.createUser(customer.id, name, email, role, role_id, manager);
      });
      const actor: User = await this.usersRepo.findOneOrFail({ where: { id: created_by }, relations: ['customer'] });
      const resetPasswordToken: string = await this.resetPasswordTokenSrvc.createResetPasswordToken(actor.id, user.id, ResetPasswordTokenType.USER_INVITE);
      const emailBody: string = NewAdminInviteEmail({
        adminName: name,
        orgName: customer.organization_name,
        inviterName: actor.name,
        inviteLink: `${this.config.get<string>('FE_HOST')}${this.config.get<string>('USER_INVITATION_URL')}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetPasswordToken)}`,
      });

      this.emailService.sendEmail(email, [], `ProGRC - You're invited to join ${customer.organization_name}`, emailBody);
      return {
        message: "Organization User created successfully and invite sent on email.",
      };
    } catch (error) {
      this.logger.info(error);

      throw new BadRequestException({
        error: error.message,
        message: error.message,
      });
    }
  }

  async createUser(customerId: string, name: string, email: string, role: string, role_id: number, manager: EntityManager) {
    try {
      const userData: User = manager.create(User, {
        id: uuidv4(),
        name,
        role_id: +(role_id + ""),
        email,
        invite_status: InviteStatus.SENT,
        customer_id: customerId,
      });

      return await manager.save(userData);
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'UQ_97672ac88f789774dd47f7c8be3') {
        throw new BadRequestException({
          error: 'Email already exists',
          message: 'This email address is already registered in the system. Please use a different email address.'
        });
      }
      throw error;
    }
  }

  private async createNewCustomer(manager: EntityManager, org_name: string, created_by: string, license_type_id: number, license_start_date: Date, license_end_date: Date): Promise<Customer> {
    const customerData: Customer = manager.create(Customer, {
      organization_name: org_name || "N/A",
      created_by: created_by,
      license_type_id: license_type_id || 1,
      license_start_date: license_start_date,
      license_end_date: license_end_date,
    });

    return await manager.save(customerData);
  }

  mapTokenAttributes(userData: Partial<CognitoJwtInterface> | null) {
    const toRet = {};
    if (!userData) {
      throw "Invalid token";
    }

    toRet["userId"] = userData.sub;
    toRet["email_verified"] = userData.email_verified;
    toRet["email"] = userData.email;
    toRet["tenant_id"] = userData["custom:tenant_id"];
    toRet["roles"] = userData["custom:roles"];
    toRet["role_id"] = userData["custom:role_id"];
    toRet['customerId'] = userData["custom:tenant_id"];
    toRet['impersonateExpTime'] = userData['custom:imperson_exp_time'];

    return toRet;
  }

  verifyToken(token: string) {
    const cognitoClientId = this.config.get<string>("COGNITO_CLIENT_ID");

    return new Promise(async (resolve, reject) => {
      const decodedJwt = decode(token, { complete: true }) as DecodedJwt;
      if (
        !decodedJwt ||
        !decodedJwt.payload ||
        decodedJwt.payload.aud !== cognitoClientId ||
        !decodedJwt.payload.iss
      ) {
        this.logger.info("sad", token);

        return reject("Invalid token");
      }

      readFile("static/aws-jwks.json", "utf8")
        .then((fileData) => {
          const data = JSON.parse(fileData);
          const key = data.keys.find((key: any) => {
            return key.kid === decodedJwt.header.kid;
          });
          const pem = jwkToPem(key);
          return verify(
            token,
            pem,
            { algorithms: ["RS256"] },
            (err, decodedToken) => {
              if (err) {
                return reject("Invalid token");
              }

              resolve({
                ...(decodedToken as Partial<CognitoJwtInterface>),
                ...this.mapTokenAttributes(
                  decodedToken as Partial<CognitoJwtInterface>
                ),
              });
            }
          );
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }

  verifyToken1(token: string) {
    // const cognitoClientId = this.config.get<string>('COGNITO_CLIENT_ID');
    return new Promise(async (resolve, reject) => {
      const userData = await this.cognitoSvc.getUserDataByToken(token);

      const toRet = {};
      if (!userData) {
        return reject("Invalid token");
      }
      toRet["userId"] = userData.userId;
      if (userData && userData.attributes) {
        userData.attributes.forEach((attr) => {
          const attrName = attr["Name"];
          if (attrName.includes("custom:")) {
            const splitted = attrName.split(":");
            const actualname = splitted[1];
            toRet[actualname] = attr.Value;
          } else {
            toRet[attrName] = attr.Value;
          }
        });
      }
      return resolve(toRet);
    });
  }

  verifyUserAccess(userId: string, allowedRoles?: any[]) {
    return new Promise(async (resolve, reject) => {
      if (!Array.isArray(allowedRoles)) {
        allowedRoles = [];
      }
      const userInfo = await this.usersRepo.find({ where: { id: userId } });
      if (!userInfo || !userInfo.length) {
        return reject(`Invalid User`);
      }
      const user = userInfo[0];
      if (user.role_id !== 1 && !allowedRoles.includes(user.role_id)) {
        this.logger.info(`this user do not have role required to access this route`);
        return reject(
          `Access Denied! You do not have permission to access this api. Please contact support!`
        );
      }
      resolve(user);
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepo.findOne({ 
      where: { email },
      select: [
        'id', 'name', 'mobile', 'profile_image_key', 'email', 'customer_id',
        'invite_status', 'role_id', 'created_at', 'updated_at', 'deleted',
        'tos_accepted_at', 'is_profile_image_available', 'image_updated_at',
        'temp_profile_image_key', 'password_hash', 'is_locked', 'mfa_enabled',
        'primary_mfa_type', 'last_password_change',
        'password_reset_required', 'reset_password_code', 'reset_password_expires'
      ]
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.is_locked) {
      throw new UnauthorizedException('Account is locked. Please reset your password.');
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Password not set. Please reset your password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async generateTokens(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
      customer_id: user.customer_id,
      mfa_enabled: user.mfa_enabled,
      primary_mfa_type: user.primary_mfa_type
    };

    return sign(
      payload,
      this.config.get('ACCESS_TOKEN_SIGNATURE_PRIVATE'),
      {
        algorithm: 'RS256',
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        issuer: 'progrc-auth',
        audience: 'progrc-auth',
        keyid: 'progrc-key-1'
      }
    );
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepo.save({
      user_id: user.id,
      token,
      expires_at: expiresAt
    });

    return sign(
      { sub: user.id, token },
      this.config.get('REFRESH_TOKEN_SIGNATURE'),
      {
        algorithm: 'HS256',
        expiresIn: this.REFRESH_TOKEN_EXPIRY
      }
    );
  }

  async verifyAccessToken(token: string) {
    try {
      return verify(token, this.config.get('ACCESS_TOKEN_SIGNATURE_PUBLIC'), {
        algorithms: ['RS256'],
        issuer: 'progrc-auth',
        audience: 'progrc-auth'
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      const decoded = verify(token, this.config.get('REFRESH_TOKEN_SIGNATURE'), {
        algorithms: ['HS256']
      }) as { sub: string; token: string };

      const refreshToken = await this.refreshTokenRepo.findOne({
        where: {
          user_id: decoded.sub,
          token: decoded.token,
          revoked_at: null
        }
      });

      if (!refreshToken || refreshToken.expires_at < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  async validatePasswordStrength(password: string): Promise<void> {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!hasUpperCase) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      throw new BadRequestException('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  async checkPasswordHistory(userId: string, newPasswordHash: string): Promise<boolean> {
    const recentPasswords = await this.passwordHistoryRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      take: this.PASSWORD_HISTORY_SIZE
    });

    for (const history of recentPasswords) {
      if (await bcrypt.compare(newPasswordHash, history.password_hash)) {
        return false;
      }
    }

    return true;
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    await this.validatePasswordStrength(newPassword);
    const passwordHash = await this.hashPassword(newPassword);

    const isPasswordUnique = await this.checkPasswordHistory(userId, passwordHash);
    if (!isPasswordUnique) {
      throw new BadRequestException('New password must be different from your last 3 passwords');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Save new password hash
    user.password_hash = passwordHash;
    user.last_password_change = new Date();
    user.password_reset_required = false;
    await this.usersRepo.save(user);

    // Add to password history
    await this.passwordHistoryRepo.save({
      user_id: userId,
      password_hash: passwordHash
    });
  }

  // Legacy MFA methods removed - functionality moved to MfaService
  // Use MfaController and MfaService for all MFA operations

  async revokeRefreshToken(token: string): Promise<void> {
    const decoded = await this.verifyRefreshToken(token);
    await this.refreshTokenRepo.update(
      { token: decoded.token },
      { revoked_at: new Date() }
    );
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepo.update(
      { user_id: userId, revoked_at: null },
      { revoked_at: new Date() }
    );
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  generatePreAuthToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      mfa_required: true
    };

    return sign(
      payload,
      this.config.get('ACCESS_TOKEN_SIGNATURE_PRIVATE'),
      {
        algorithm: 'RS256',
        expiresIn: '5m', // Short-lived token for MFA
        issuer: 'progrc-auth',
        audience: 'progrc-auth',
        keyid: 'progrc-key-1'
      }
    );
  }

  async signup(signUpDto: SignUpDto) {
    // Check if user already exists
    const existingUser = await this.usersRepo.findOne({ 
      where: { email: signUpDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate password strength
    await this.validatePasswordStrength(signUpDto.password);

    // Hash password
    const passwordHash = await this.hashPassword(signUpDto.password);

    // Create user with generated UUID
    const user = this.usersRepo.create({
      id: uuidv4(), // Generate UUID for the user
      name: signUpDto.username,
      email: signUpDto.email,
      password_hash: passwordHash,
      role_id: UserRole.OrgMember, // Default role for new signups
      invite_status: InviteStatus.JOINED,
      created_at: new Date(),
      updated_at: new Date()
    });

    await this.usersRepo.save(user);

    // Add to password history
    await this.passwordHistoryRepo.save({
      user_id: user.id,
      password_hash: passwordHash
    });

    return {
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
}
