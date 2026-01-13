//Ref ->>> https://www.linkedin.com/pulse/configure-implement-aws-cognito-usingnestjs-asim-hafeez-yhhqf
import {
  AdminCreateUserCommand,
  AdminCreateUserCommandOutput,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  ChallengeNameType,
  ChangePasswordCommand,
  ChangePasswordCommandInput,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
  ForgotPasswordCommand,
  ForgotPasswordCommandInput,
  GetUserCommand,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  ResendConfirmationCodeCommand,
  ResendConfirmationCodeCommandInput,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  SignUpCommandInput
} from "@aws-sdk/client-cognito-identity-provider";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import * as metadata from "../common/metadata";
import { LoggerService } from "src/logger/logger.service";
const userRoles = metadata["userRoles"];
const inviteStatus = metadata["inviteStatus"];

@Injectable()
export class CognitoService {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private cognitoClientId;
  private cognitoRegion;
  private userPoolId;
  private impersonateTimeoutSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly logger: LoggerService
  ) {
    this.cognitoClientId = this.configService.get("COGNITO_CLIENT_ID") || process.env.COGNITO_CLIENT_ID;
    this.cognitoRegion = this.configService.get("COGNITO_REGION") || process.env.COGNITO_REGION || "us-east-1";
    this.userPoolId = this.configService.get("COGNITO_USER_POOL_ID") || process.env.COGNITO_USER_POOL_ID;
    this.impersonateTimeoutSeconds = (this.configService.get("IMPERSONATE_TIMEOUT_SECONDS") || 3600) * 1000;
    
    // Only initialize Cognito client if region is provided and not empty
    if (this.cognitoRegion && this.cognitoRegion.trim() && this.cognitoRegion !== "..") {
      try {
        // Initialize AWS Cognito SDK client without explicit credentials (will use IAM role)
        this.cognitoClient = new CognitoIdentityProviderClient({
          region: this.cognitoRegion.trim(),
        });
        this.logger.log(`Cognito client initialized with region: ${this.cognitoRegion}`);
      } catch (error) {
        this.logger.error("Failed to initialize Cognito client", error);
        // Create a dummy client to prevent errors (will fail gracefully when used)
        this.cognitoClient = new CognitoIdentityProviderClient({
          region: "us-east-1",
        });
      }
    } else {
      this.logger.warn("COGNITO_REGION not configured or invalid. Cognito features will be disabled.");
      // Create a dummy client to prevent errors (will fail gracefully when used)
      this.cognitoClient = new CognitoIdentityProviderClient({
        region: "us-east-1", // Default region, but operations will fail if not configured
      });
    }
  }

  async getUserDataByToken(token: string) {
    const command = new GetUserCommand({
      AccessToken: token,
    });

    try {
      const response = await this.cognitoClient.send(command);
      return { attributes: response.UserAttributes, userId: response.Username };
    } catch (error) {
      this.logger.info(`Error when fetching user data from cognito...`);
      return null;
    }
  }

  // Signup command
  async signUpCommand(data) {
    try {
      const { email, password } = data;
      const params: SignUpCommandInput = {
        ClientId: this.cognitoClientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
          // {
          //     Name: 'custom:role_id',
          //     Value: userRoles['super_admin'] + "",
          // },
          // {
          //     Name: 'custom:roles',
          //     Value: 'super_admin',
          // },
        ],
      };
      const response = await this.cognitoClient.send(new SignUpCommand(params));
      if (response && response.UserSub) {
        //create user in db
        const toCreate = this.usersRepo.create({
          id: response.UserSub,
          name: "Super Admin",
          email,
          role_id: userRoles["super_admin"],
        });
        const created = await this.usersRepo.save(toCreate);
        return created;
      }
      throw new Error("Could not create user at the moment!");
    } catch (error) {
      this.logger.info(error);
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  // Confirm signup command
  async confirmSignUpCommand(data) {
    try {
      const { email, confirmationCode } = data;
      const params: ConfirmSignUpCommandInput = {
        ClientId: this.cognitoClientId,
        Username: email,
        ConfirmationCode: confirmationCode,
      };

      return await this.cognitoClient.send(new ConfirmSignUpCommand(params));
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  // signin Command
  async signInCommand(data) {
    try {
      const { email, password } = data;

      const params: InitiateAuthCommandInput = {
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: this.cognitoClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      };

      const response = await this.cognitoClient.send(
        new InitiateAuthCommand({ ...params })
      );
      if (response) {
        this.logger.info("response: ", response);
        if (!response.AuthenticationResult) {
          return {
            data: {
              session: response.Session,
              ChallengeName: response.ChallengeName,
            },
          };
        } else {
          return {
            data: {
              token: response.AuthenticationResult.IdToken,
              // ...response.AuthenticationResult,
            },
          };
        }
      }
      throw new Error("Unable to login!");
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  // resend confirmation code
  async resendConfirmationCodeCommand(data) {
    try {
      const { email } = data;
      const params: ResendConfirmationCodeCommandInput = {
        ClientId: this.cognitoClientId,
        Username: email,
      };

      return await this.cognitoClient.send(
        new ResendConfirmationCodeCommand(params)
      );
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  // forgot Passowrd
  async forgotPasswordCommand(data) {
    try {
      const { email } = data;
      const params: ForgotPasswordCommandInput = {
        ClientId: this.cognitoClientId,
        Username: email,
      };

      return await this.cognitoClient.send(new ForgotPasswordCommand(params));
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  // confirm forgot password
  async confirmForgotPasswordCommand(data) {
    try {
      const { email, confirmationCode, newPassword } = data;
      const params: ConfirmForgotPasswordCommandInput = {
        ClientId: this.cognitoClientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      };

      return await this.cognitoClient.send(
        new ConfirmForgotPasswordCommand(params)
      );
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  // change password using accessToken
  async changePasswordCommand(data) {
    try {
      const { accessToken, oldPassword, newPassword } = data;
      const params: ChangePasswordCommandInput = {
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
      };

      return await this.cognitoClient.send(new ChangePasswordCommand(params));
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async createOrgUser(
    email: string,
    tempPwd: string,
    org_id: string,
    role_id: string,
    role: string
  ) {
    try {
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        TemporaryPassword: tempPwd,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
          //   {
          //     Name: 'email_verified',
          //     Value: 'true',
          //   },
          {
            Name: "custom:role_id",
            Value: role_id,
          },
          {
            Name: "custom:tenant_id",
            Value: org_id,
          },
        ],
        MessageAction: 'SUPPRESS',
      });
      return await this.cognitoClient.send(createUserCommand);
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async respondToNewPasswordChallenge(
    email: string,
    newPassword: string,
    session: string
  ) {
    try {
      const params = {
        ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
        ClientId: this.cognitoClientId,
        Session: session,
        ChallengeResponses: {
          USERNAME: email,
          NEW_PASSWORD: newPassword,
        },
      };

      const command = new RespondToAuthChallengeCommand(params);
      //update invite status to joined
      const user = await this.usersRepo.findOne({
        where: { email }
      });
      if (user) {
        await this.usersRepo.update({ id: user.id }, { invite_status: inviteStatus['joined'] });
      }
      return await this.cognitoClient.send(command);
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async resendInvitationEmail(email: string) {
    const command = new AdminCreateUserCommand({
      UserPoolId: this.userPoolId,
      Username: email,
      MessageAction: 'RESEND',
    });

    try {
      return await this.cognitoClient.send(command);
    } catch (error) {
      this.logger.error('Error resending invitation email:', error);
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async deleteUser(id: string) {
    const command = new AdminDeleteUserCommand({
      UserPoolId: this.userPoolId,
      Username: id,
    });

    try {
      return await this.cognitoClient.send(command);
    } catch (error) {
      this.logger.error('Error deleting user:', error);
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async createInternalUser(email: string, role_id: number): Promise<AdminCreateUserCommandOutput> {
    // Check if Cognito is properly configured
    if (!this.userPoolId || !this.cognitoRegion || this.cognitoRegion.trim() === "" || this.cognitoRegion === "..") {
      this.logger.warn("Cognito not configured. Skipping Cognito user creation.", {
        userPoolId: !!this.userPoolId,
        region: this.cognitoRegion
      });
      // Return a mock response to allow the flow to continue
      return {
        User: {
          Username: email.toLowerCase(),
          UserStatus: 'FORCE_CHANGE_PASSWORD',
          UserCreateDate: new Date(),
          UserLastModifiedDate: new Date(),
        }
      } as AdminCreateUserCommandOutput;
    }

    try {
      const temporaryPassword = `tPwd123_${email.toLowerCase()}`;
      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email.toLowerCase(),
        TemporaryPassword: temporaryPassword,
        UserAttributes: [
          {
            Name: "email",
            Value: email.toLowerCase(),
          },
          {
            Name: "custom:role_id",
            Value: String(role_id),
          },
        ],
        MessageAction: 'SUPPRESS',
      });
      return await this.cognitoClient.send(createUserCommand);
    } catch (error) {
      this.logger.error("Failed to create Cognito user. Continuing without Cognito.", error);
      // Return a mock response to allow the flow to continue
      return {
        User: {
          Username: email.toLowerCase(),
          UserStatus: 'FORCE_CHANGE_PASSWORD',
          UserCreateDate: new Date(),
          UserLastModifiedDate: new Date(),
        }
      } as AdminCreateUserCommandOutput;
    }
  }

  async resetUserPassword(userId: string): Promise<string> {
    const randomPassword: string = this.generateRandomPassword();
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
      Username: userId,
      Password: randomPassword,
      Permanent: false, // force user to change password on first login
    });

    await this.cognitoClient.send(command);
    return randomPassword;
  }

  async changeUserPassword(userId: string, newPassword: string): Promise<void> {
    const command = new AdminSetUserPasswordCommand({
      UserPoolId: this.userPoolId,
      Username: userId,
      Password: newPassword,
      Permanent: true,
    });

    await this.cognitoClient.send(command);
  }

  private generateRandomPassword(length: number = 12): string {
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?';

    // Ensure at least one character from each category
    const getRandom = (chars: string) => chars[Math.floor(Math.random() * chars.length)];
    let password = getRandom(lowerChars) + getRandom(upperChars) + getRandom(numbers) + getRandom(specialChars);

    // Fill the rest of the password length with random characters from all categories
    const allChars = lowerChars + upperChars + numbers + specialChars;
    for (let i = password.length; i < length; i++) {
      password += getRandom(allChars);
    }

    // Shuffle the generated password to ensure randomness
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async impersonateCustomer(userId: string, customerId: string): Promise<void> {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.userPoolId,
      Username: userId,
      UserAttributes: [
        {
          Name: 'custom:tenant_id',
          Value: customerId,
        },
        {
          Name: 'custom:imperson_exp_time',
          Value: new Date(Date.now() + this.impersonateTimeoutSeconds).toISOString(),
        },
      ],
    });

    await this.cognitoClient.send(command);
  }

  async removeImpersonation(userId: string): Promise<void> {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.userPoolId,
      Username: userId,
      UserAttributes: [
        {
          Name: 'custom:tenant_id',
          Value: '',
        },
        {
          Name: 'custom:imperson_exp_time',
          Value: '',
        },
      ],
    });

    await this.cognitoClient.send(command);
    this.logger.info('Impersonation stopped successfully.', userId);
  }

  async updateUserEmail(userId: string, newEmail: string): Promise<void> {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.userPoolId,
      Username: userId,
      UserAttributes: [
        {
          Name: 'email',
          Value: newEmail,
        },
      ],
    });

    await this.cognitoClient.send(command);
  }

  async updateUserRole(userId: string, newRoleId: number): Promise<void> {
    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: this.userPoolId,
      Username: userId,
      UserAttributes: [
        {
          Name: "custom:role_id",
          Value: String(newRoleId),
        },
      ],
    });

    await this.cognitoClient.send(command);
  }
}
