// Simple HTML email builders (no external @kovr-ai/app-common dependency)
const wrap = (title: string, body: string) => `
<!DOCTYPE html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body style="font-family: Arial, sans-serif; background: #f5f6fa; margin:0; padding:0;">
    <div style="max-width:640px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
      <h2 style="margin:0 0 12px 0;font-size:20px;">${title}</h2>
      <div style="font-size:14px;line-height:1.5;color:#111827;">${body}</div>
      <div style="margin-top:24px;font-size:12px;color:#6b7280;">ProGRC Notifications</div>
    </div>
  </body>
</html>
`;

export const NewAdminInviteEmail = ({
  adminName,
  orgName,
  inviterName,
  inviteLink,
}: {
  adminName: string;
  orgName: string;
  inviterName: string;
  inviteLink: string;
}) =>
  wrap(
    "You're invited to join ProGRC",
    `Hi ${adminName},<br/><br/>${inviterName} invited you to administer ${orgName} on ProGRC.<br/><br/><a href="${inviteLink}">Accept your invitation</a>`
  );

export const InternalUserInviteEmail = ({
  name,
  roleName,
  inviterName,
  inviteLink,
}: {
  name: string;
  roleName: string;
  inviterName: string;
  inviteLink: string;
}) =>
  wrap(
    "Account activated",
    `Hi ${name},<br/><br/>${inviterName} added you as ${roleName} in ProGRC.<br/><br/><a href="${inviteLink}">Activate your account</a>`
  );

export const ResetUserPasswordEmail = ({
  name,
  resetPasswordLink,
  expiryTime,
}: {
  name: string;
  resetPasswordLink: string;
  expiryTime: string;
}) =>
  wrap(
    "Reset your password",
    `Hi ${name},<br/><br/>Use the link below to reset your password. The link is valid for ${expiryTime}.<br/><br/><a href="${resetPasswordLink}">Reset Password</a>`
  );

export const PlanExpired = ({ adminName }: { adminName: string }) =>
  wrap(
    "License expired",
    `Hi ${adminName},<br/><br/>Your ProGRC license has expired. Please renew to continue service.`
  );

export const PlanUpcomingExpiry = ({
  adminName,
  expiryDays,
}: {
  adminName: string;
  expiryDays: number;
}) =>
  wrap(
    "License expiring soon",
    `Hi ${adminName},<br/><br/>Your ProGRC license will expire in ${expiryDays} day(s). Please renew.`
  );

export const PlanExpiryCSM = ({
  orgName,
  orgId,
  adminEmail,
  expiryDays,
}: {
  orgName: string;
  orgId: string | number;
  adminEmail: string;
  expiryDays: number;
}) =>
  wrap(
    "Customer license expiring",
    `${orgName} (ID: ${orgId}) license expires in ${expiryDays} day(s).<br/>Admin contact: ${adminEmail}`
  );
