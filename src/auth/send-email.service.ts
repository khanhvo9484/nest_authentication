import { Injectable } from '@nestjs/common';
import sparkpostClient from './email-sender/sparkpost';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendEmailService {
  constructor(private config: ConfigService) {}
  async sendVerificationEmail(to: string, token: string) {
    let verifyLink = `${this.config.get(
      'FE_EMAIL_VERIFICATION_URL',
    )}email=${to}&token=${token}`;

    verifyLink = verifyLink.replace(this.config.get('PROTOCOL'), '');

    sparkpostClient.transmissions
      .send({
        options: {
          sandbox: false, // Set to false for actual delivery
        },
        content: {
          template_id: 'email-verification',
          protocol: this.config.get('PROTOCOL'),
        },
        substitution_data: {
          verify_link: verifyLink,
        },
        recipients: [{ address: to }],
      })
      .then((data) => {
        return true;
      })
      .catch((err) => {
        throw new Error('Error in sending email');
      });
  }
  async sendResetPasswordEmail(to: string, token: string) {
    let resetPasswordLink = `${this.config.get(
      'FE_RESET_PASSWORD_URL',
    )}email=${to}&token=${token}`;

    resetPasswordLink = resetPasswordLink.replace(
      this.config.get('PROTOCOL'),
      '',
    );

    sparkpostClient.transmissions
      .send({
        options: {
          sandbox: false, // Set to false for actual delivery
        },
        content: {
          template_id: 'email-forgot-password',
          protocol: this.config.get('PROTOCOL'),
        },
        substitution_data: {
          reset_password_link: resetPasswordLink,
        },
        recipients: [{ address: to }],
      })
      .then((data) => {
        return true;
      })
      .catch((err) => {
        throw new Error('Error in sending email');
      });
  }
  async sendTestEmail(to: string) {}
}
