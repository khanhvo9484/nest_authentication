import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
const path = require('path');
import sparkpostClient from './email-sender/sparkpost';

@Injectable()
export class SendEmailService {
  async sendVerificationEmail(to: string, token: string) {
    let htmlString: string = '';
    const templatePath = path.join(
      __dirname,
      '..',
      'src',
      'html-template',
      'email-template',
      'VerifyEmail.html',
    );
    try {
      htmlString = fs.readFileSync(templatePath, 'utf-8');
    } catch (err) {
      throw new Error(err);
    }
    htmlString = htmlString
      .replace('{{verification_link}}', token)
      .replace('{{logo}}', 'logo');

    sparkpostClient.transmissions
      .send({
        options: {
          sandbox: false, // Set to false for actual delivery
        },
        content: {
          from: process.env.SPAKPOST_EMAIL_FROM_NAME, // Update to a valid email address
          subject: 'Verify your email',
          html: htmlString,
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
}
