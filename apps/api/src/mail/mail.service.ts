import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type InvitationEmailStatus = 'sent' | 'skipped' | 'failed';

export interface InvitationDeliveryResult {
  emailStatus: InvitationEmailStatus;
  inviteUrl: string;
}

export interface MailStatus {
  configured: boolean;
  ready: boolean;
  error: string | null;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromAddress: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private readonly frontendUrl: string;
  private readonly smtpConfig: SmtpConfig | null;
  private transporter: Transporter | null = null;
  private connectionError: string | null = null;
  private connectionReady = false;

  constructor(private readonly config: ConfigService) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    this.smtpConfig = this.readSmtpConfig();

    if (!this.smtpConfig) {
      this.logger.warn('SMTP not configured - invitation emails will be skipped');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.smtpConfig.host,
      port: this.smtpConfig.port,
      secure: this.smtpConfig.secure,
      auth: {
        user: this.smtpConfig.user,
        pass: this.smtpConfig.pass,
      },
    });

    this.logger.log(
      `SMTP configured: ${this.smtpConfig.host}:${this.smtpConfig.port} secure=${this.smtpConfig.secure}`,
    );
  }

  async onModuleInit() {
    if (this.transporter) {
      await this.verifyConnection();
    }
  }

  get isConfigured(): boolean {
    return this.smtpConfig !== null;
  }

  get status(): MailStatus {
    return {
      configured: this.isConfigured,
      ready: this.connectionReady,
      error: this.connectionError,
    };
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      this.connectionReady = false;
      this.connectionError = null;
      return false;
    }

    try {
      await this.transporter.verify();
      this.connectionReady = true;
      this.connectionError = null;
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown SMTP verification error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.connectionReady = false;
      this.connectionError = message;
      this.logger.error(`SMTP verification failed: ${message}`, stack);
      return false;
    }
  }

  async sendInvitation(
    email: string,
    token: string,
    role: string,
  ): Promise<InvitationDeliveryResult> {
    const inviteUrl = this.buildInviteUrl(token);

    if (!this.transporter || !this.smtpConfig) {
      this.logger.warn(`SMTP not configured. Invite link for ${email}: ${inviteUrl}`);
      return { emailStatus: 'skipped', inviteUrl };
    }

    try {
      await this.transporter.sendMail({
        from: `"SalesTrack Academy" <${this.smtpConfig.fromAddress}>`,
        to: email,
        subject: "You're invited to SalesTrack Academy",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="padding:32px 32px 24px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">You're Invited!</h1>
          <p style="margin:0;color:#666;font-size:14px;line-height:1.5;">
            You've been invited to join <strong>SalesTrack Academy</strong> as
            <strong style="text-transform:lowercase;">${role === 'ADMIN' ? 'an admin' : 'an agent'}</strong>.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <a href="${inviteUrl}"
             style="display:inline-block;padding:12px 32px;background:#111;color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
            Accept Invitation
          </a>
          <p style="margin:16px 0 0;color:#999;font-size:12px;">
            This invitation expires in 7 days.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;color:#aaa;font-size:11px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        text: `You've been invited to SalesTrack Academy as ${role === 'ADMIN' ? 'an admin' : 'an agent'}.\n\nAccept your invitation: ${inviteUrl}\n\nThis invitation expires in 7 days.`,
      });

      this.connectionReady = true;
      this.connectionError = null;
      this.logger.log(`Invitation email sent to ${email}`);
      return { emailStatus: 'sent', inviteUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown SMTP send error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.connectionReady = false;
      this.connectionError = message;
      this.logger.error(`Failed to send invitation email to ${email}: ${message}`, stack);
      return { emailStatus: 'failed', inviteUrl };
    }
  }

  private readSmtpConfig(): SmtpConfig | null {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      return null;
    }

    const port = this.config.get<number>('SMTP_PORT', 587);
    const secureOverride = this.config.get<boolean>('SMTP_SECURE');
    const secure = secureOverride ?? port === 465;
    const fromAddress = this.config.get<string>('SMTP_FROM') || user;

    return {
      host,
      port,
      secure,
      user,
      pass,
      fromAddress,
    };
  }

  private buildInviteUrl(token: string) {
    const inviteUrl = new URL('/public/accept-invite', this.frontendUrl);
    inviteUrl.searchParams.set('token', token);
    return inviteUrl.toString();
  }
}
