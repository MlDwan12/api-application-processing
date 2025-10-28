/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { LeadsService } from 'src/leads/leads.service';
import { BitrixCurrency } from 'src/shared/enums';
import {
  BitrixLead,
  BitrixPayload,
  BitrixResponse,
  BitrixUserField,
  BitrixUserFieldListResponse,
} from 'src/shared/types';

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
  }

  // ----------------- Bitrix уведомление -----------------
  async sendBitrixNotification(
    payload: BitrixPayload,
  ): Promise<BitrixResponse<BitrixLead> | void> {
    try {
      const webhookUrl = this.config.get<string>('BITRIX_WEBHOOK_URL')!;

      const userFields = await axios.get<BitrixUserFieldListResponse>(
        `${webhookUrl}/crm.lead.userfield.list.json`,
      );

      const hasField = userFields.data.result.some(
        (f: BitrixUserField) =>
          f.FIELD_NAME === 'UF_CRM_CREATED_BY_API' ||
          f.XML_ID === 'UF_CREATED_BY_API',
      );

      if (!hasField) {
        await axios
          .post(`${webhookUrl}/crm.lead.userfield.add.json`, {
            fields: {
              FIELD_NAME: 'UF_CRM_CREATED_BY_API',
              EDIT_FORM_LABEL: { ru: 'Создано через API' },
              LIST_COLUMN_LABEL: { ru: 'Создано через API' },
              USER_TYPE_ID: 'boolean',
              XML_ID: 'UF_CREATED_BY_API',
              SETTINGS: { DEFAULT_VALUE: true },
            },
          })
          .catch((error) => {
            return error;
          });
      }

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
          SOURCE_ID: 'WEB',
          UF_CRM_CREATED_BY_API: true,
        },
      };

      const response: AxiosResponse<BitrixLead> = await axios.post(
        `${webhookUrl}/crm.lead.add.json`,
        lead,
      );

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        responseSummary[channel] = { error: res.reason };
        this.logger.error(`${channel} notification failed: ${res.reason}`);
      }
    });
    return responseSummary;
  }
}
