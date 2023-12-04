import { Injectable } from '@nestjs/common';
import sparkpostClient from './email-sender/sparkpost';
import { ConfigService } from '@nestjs/config';
import { MyLogger } from 'logger/logger.service';
@Injectable()
export class SendEmailService {
  constructor(private config: ConfigService) {}
  async sendVerificationEmail(to: string, token: string) {
    let verifyLink = `${this.config.get(
      'FE_EMAIL_VERIFICATION_URL',
    )}email=${to}&token=${token}`;

    const logger = new MyLogger();
    verifyLink = verifyLink.replace(this.config.get('PROTOCOL'), '');
    logger.log('verify link: ', verifyLink, '/n');
    logger.log('protocol: ', this.config.get('PROTOCOL'), '/n');

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
    const logger = new MyLogger();
    let resetPasswordLink = `${this.config.get(
      'FE_RESET_PASSWORD_URL',
    )}email=${to}&token=${token}`;

    resetPasswordLink = resetPasswordLink.replace(
      this.config.get('PROTOCOL'),
      '',
    );
    logger.log('resetpassword_link: ', resetPasswordLink, '/n');
    logger.log('protocol: ', this.config.get('PROTOCOL'), '/n');

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
