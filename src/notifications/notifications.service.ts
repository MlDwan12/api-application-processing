import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { BITRIX_WEBHOOK_URL } from './notifications.constants';
import { BitrixCurrency } from 'src/shared/enums';
import { BitrixPayload } from 'src/shared/types';
import { LeadsService } from 'src/leads/leads.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter;
  private telegramBot;

  constructor(
    private readonly config: ConfigService,
    private readonly leadsService: LeadsService,
  ) {
    // ----------------- Настройка SMTP (Email) -----------------
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !port || !user || !pass) {
      throw new Error('SMTP configuration is missing in .env');
    }

    // this.transporter = nodemailer.createTransport({
    //   host,
    //   port,
    //   secure: false,
    //   auth: { user, pass },
    // });

    // ----------------- Настройка Telegram -----------------
    // const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    // if (!token) {
    //   throw new Error('TELEGRAM_BOT_TOKEN is missing in .env');
    // }
    // this.telegramBot = new TelegramBot(token);

    // ----------------- Проверка Bitrix Webhook -----------------
    if (!BITRIX_WEBHOOK_URL) {
      throw new Error('BITRIX_WEBHOOK_URL is missing in .env');
    }
  }

  // ----------------- Bitrix уведомление -----------------
  async sendBitrixNotification(payload: BitrixPayload) {
    try {
      const lead = {
        fields: {
          TITLE: `Новая заявка от ${payload.name}`,
          NAME: payload.name,
          EMAIL: [{ VALUE: payload.email, VALUE_TYPE: 'WORK' }],
          COMMENTS: payload.message || '',
          OPPORTUNITY: payload.opportunity || 0,
          CURRENCY_ID: payload.currency_id || BitrixCurrency.RUB,
          PHONE: [
            {
              VALUE: payload.phone || '',
              VALUE_TYPE: 'WORK',
            },
          ],
        },
      };

      const response = await axios.post(BITRIX_WEBHOOK_URL, lead);

      await this.leadsService.createLead({
        bitrixId: response.data.result.toString() as number,
        title: `Заявка от ${payload.name}`,
        contactName: payload.name,
        contactEmail: payload.email,
        contactPhone: payload.phone,
        opportunity: payload.opportunity,
        currency: payload.currency_id,
        additionalData: {
          message: payload.message,
          applicationId: payload.applicationId,
        },
        processed: true,
      });
      this.logger.log(`Bitrix response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error(`Bitrix error: ${(error as Error).message}`);
    }
  }

  // ----------------- Email уведомление -----------------
  //   async sendEmailNotification(payload: any) {
  //     try {
  //       await this.transporter.sendMail({
  //         from: `"App Notifications" <${this.config.get('SMTP_USER')}>`,
  //         to: this.config.get('ADMIN_EMAIL'),
  //         subject: `Новая заявка от ${payload.name}`,
  //         text: `Email: ${payload.email}\nMessage: ${payload.message || '-'}`,
  //       });
  //       this.logger.log(`Email sent to admin`);
  //     } catch (error) {
  //       this.logger.error(`Email error: ${(error as Error).message}`);
  //     }
  //   }

  // ----------------- Telegram уведомление -----------------
  //   async sendTelegramNotification(payload: any) {
  //     try {
  //       const message = `Новая заявка\nИмя: ${payload.name}\nEmail: ${payload.email}\nСообщение: ${payload.message || '-'}`;
  //       await this.telegramBot.sendMessage(
  //         this.config.get('ADMIN_TELEGRAM_ID'),
  //         message,
  //       );
  //       this.logger.log(`Telegram notification sent`);
  //     } catch (error) {
  //       this.logger.error(`Telegram error: ${(error as Error).message}`);
  //     }
  //   }

  // ----------------- Отправка уведомлений по всем каналам -----------------
  async notifyAllChannels(payload: BitrixPayload) {
    const responseSummary = {};
    const results = await Promise.allSettled([
      this.sendBitrixNotification(payload),
      //   this.sendEmailNotification(payload),
      //   this.sendTelegramNotification(payload),
    ]);

    results.forEach((res, idx) => {
      const channel = ['Bitrix', 'Email', 'Telegram'][idx];
      if (res.status === 'fulfilled') {
        responseSummary[channel] = res.value;
        this.logger.log(`${channel} notification sent successfully`);
      } else {
        responseSummary[channel] = { error: res.reason };
        this.logger.error(`${channel} notification failed: ${res.reason}`);
      }
    });
    return responseSummary;
  }
}
