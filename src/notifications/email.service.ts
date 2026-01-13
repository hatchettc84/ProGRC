import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoggerService } from 'src/logger/logger.service';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: Transporter;

    constructor(
        private readonly configService: ConfigService,
        private readonly sesClient: SESClient,
        private readonly logger: LoggerService
    ) {
        // Initialize nodemailer transporter for SMTP
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SES_ENDPOINT'),
            port: parseInt(this.configService.get('SES_PORT', '587')),
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.configService.get('SES_SMTP_USERNAME'),
                pass: this.configService.get('SES_SMTP_PASSWORD'),
            },
        });
    }

    async sendEmail(email: string, cc: string[], subject: string, message: string) {
        this.logger.info(`Sending email to ${email} with subject: ${subject} and message: ${message}`);

        const emailSender = this.configService.get('SES_EMAIL_SENDER');
        const sesType = this.configService.get('SES_TYPE');

        if (sesType === 'api') {
            await this.sendViaSES(email, cc, subject, message, emailSender);
        } else {
            await this.sendViaSMTP(email, cc, subject, message, emailSender);
        }
    }

    private async sendViaSES(email: string, cc: string[], subject: string, message: string, emailSender: string) {
        const command = new SendEmailCommand({
            Destination: {
                ToAddresses: [email],
                CcAddresses: cc,
            },
            Message: {
                Body: {
                    Text: { Data: message },
                },
                Subject: { Data: subject },
            },
            Source: emailSender,
        });

        try {
            const result = await this.sesClient.send(command);
            this.logger.info('Email sent! Message ID:', result.MessageId);
        } catch (error) {
            this.logger.error('Failed to send email via SES:', error);
            throw error;
        }
    }

    private async sendViaSMTP(email: string, cc: string[], subject: string, message: string, emailSender: string) {
        try {
            const mailOptions = {
                from: emailSender,
                to: email,
                cc: cc,
                subject: subject,
                html: message,
            };

            const result = await this.transporter.sendMail(mailOptions);
            this.logger.info('Email sent via nodemailer SMTP! Message ID:', result.messageId);
        } catch (error) {
            this.logger.error('Failed to send email via nodemailer SMTP:', error);
            throw error;
        }
    }

    async sendTemporaryPasswordEmail(email: string, temporaryPassword: string): Promise<void> {
        const subject = 'Your Temporary Password';
        const html = `
          <h1>Welcome to ProGRC</h1>
          <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
          <p>Please login with this temporary password and set your new password immediately.</p>
          <p>For security reasons, please change your password after your first login.</p>
        `;

        await this.sendEmail(email, [], subject, html);
    }

    // === MFA Email Methods ===

    async sendMfaOtpEmail(email: string, otpCode: string, purpose: string = 'LOGIN'): Promise<void> {
        const subject = this.getMfaEmailSubject(purpose);
        const html = this.getMfaEmailTemplate(otpCode, purpose);
        await this.sendEmail(email, [], subject, html);
    }

    async sendMfaEnabledNotification(email: string, deviceType: string): Promise<void> {
        const subject = 'Multi-Factor Authentication Enabled';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Multi-Factor Authentication Enabled</h1>
                <p>Hello,</p>
                <p>Multi-Factor Authentication (MFA) has been successfully enabled on your KOVR account.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Device Type:</strong> ${this.formatDeviceType(deviceType)}
                </div>
                <p>Your account is now more secure. You'll need to provide your second factor when logging in.</p>
                <p>If you didn't enable MFA, please contact our support team immediately.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message from KOVR. Please do not reply to this email.
                </p>
            </div>
        `;
        await this.sendEmail(email, [], subject, html);
    }

    async sendMfaDisabledNotification(email: string): Promise<void> {
        const subject = 'Multi-Factor Authentication Disabled';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #e74c3c;">Multi-Factor Authentication Disabled</h1>
                <p>Hello,</p>
                <p>Multi-Factor Authentication (MFA) has been disabled on your KOVR account.</p>
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <strong>Security Notice:</strong> Your account is now less secure without MFA enabled.
                </div>
                <p>We strongly recommend re-enabling MFA to keep your account secure.</p>
                <p>If you didn't disable MFA, please contact our support team immediately and change your password.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message from KOVR. Please do not reply to this email.
                </p>
            </div>
        `;
        await this.sendEmail(email, [], subject, html);
    }

    async sendMfaBackupCodesEmail(email: string, backupCodes: string[]): Promise<void> {
        const subject = 'Your MFA Backup Codes';
        const codesHtml = backupCodes.map(code => 
            `<div style="background-color: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 3px; font-family: monospace; font-size: 16px; text-align: center;"><strong>${code}</strong></div>`
        ).join('');

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Your MFA Backup Codes</h1>
                <p>Hello,</p>
                <p>Here are your Multi-Factor Authentication backup codes. Please store them safely:</p>
                <div style="margin: 20px 0;">
                    ${codesHtml}
                </div>
                <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
                    <strong>Important:</strong>
                    <ul style="margin: 10px 0;">
                        <li>Each code can only be used once</li>
                        <li>Store these codes in a secure location</li>
                        <li>Use them if you lose access to your primary MFA device</li>
                        <li>Generate new codes if you suspect they've been compromised</li>
                    </ul>
                </div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message from KOVR. Please do not reply to this email.
                </p>
            </div>
        `;
        await this.sendEmail(email, [], subject, html);
    }

    async sendMfaDeviceAddedNotification(email: string, deviceName: string, deviceType: string): Promise<void> {
        const subject = 'New MFA Device Added';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">New MFA Device Added</h1>
                <p>Hello,</p>
                <p>A new Multi-Factor Authentication device has been added to your KOVR account.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Device Name:</strong> ${deviceName}<br>
                    <strong>Device Type:</strong> ${this.formatDeviceType(deviceType)}<br>
                    <strong>Added:</strong> ${new Date().toLocaleString()}
                </div>
                <p>If you didn't add this device, please contact our support team immediately.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message from KOVR. Please do not reply to this email.
                </p>
            </div>
        `;
        await this.sendEmail(email, [], subject, html);
    }

    private getMfaEmailSubject(purpose: string): string {
        switch (purpose) {
            case 'LOGIN':
                return 'Your KOVR Login Verification Code';
            case 'SETUP':
                return 'Your KOVR MFA Setup Verification Code';
            case 'RECOVERY':
                return 'Your KOVR Account Recovery Code';
            default:
                return 'Your KOVR Verification Code';
        }
    }

    private getMfaEmailTemplate(otpCode: string, purpose: string): string {
        const purposeText = this.getPurposeText(purpose);
        const expiryMinutes = purpose === 'LOGIN' ? '10' : '15';

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50;">Verification Code</h1>
                <p>Hello,</p>
                <p>${purposeText}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; display: inline-block; border: 2px solid #007bff;">
                        <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; font-family: monospace;">
                            ${otpCode}
                        </div>
                    </div>
                </div>
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <strong>Important:</strong>
                    <ul style="margin: 10px 0;">
                        <li>This code expires in ${expiryMinutes} minutes</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                </div>
                <p>If you're having trouble, you can also use your backup codes or contact our support team.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated message from KOVR. Please do not reply to this email.
                </p>
            </div>
        `;
    }

    private getPurposeText(purpose: string): string {
        switch (purpose) {
            case 'LOGIN':
                return 'You are attempting to log in to your KOVR account. Please use the verification code below to complete your login:';
            case 'SETUP':
                return 'You are setting up Multi-Factor Authentication for your KOVR account. Please use the verification code below to complete the setup:';
            case 'RECOVERY':
                return 'You are attempting to recover your KOVR account. Please use the verification code below to complete the recovery process:';
            default:
                return 'Please use the verification code below to complete your request:';
        }
    }

    private formatDeviceType(deviceType: string): string {
        switch (deviceType.toUpperCase()) {
            case 'TOTP':
                return 'Authenticator App (TOTP)';
            case 'PASSKEY':
                return 'PassKey/Security Key';
            case 'EMAIL':
                return 'Email Verification';
            default:
                return deviceType;
        }
    }
}
