import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
  HealthIndicatorStatus,
} from '@nestjs/terminus';
import axios from 'axios';

import { BITRIX_WEBHOOK_URL } from './notifications.constants';

@Injectable()
export class NotificationsHealthIndicator extends HealthIndicator {
  private transporter;
  private telegramBot;

  constructor(private readonly config: ConfigService) {
    super();

    // const host = config.get<string>('SMTP_HOST');
    // const port = config.get<number>('SMTP_PORT');
    // const user = config.get<string>('SMTP_USER');
    // const pass = config.get<string>('SMTP_PASS');
    // if (host && port && user && pass) {
    //   this.transporter = nodemailer.createTransport({
    //     host,
    //     port,
    //     secure: false,
    //     auth: { user, pass },
    //   });
    // }

    // const token = config.get<string>('TELEGRAM_BOT_TOKEN');
    // if (token) {
    //   this.telegramBot = new TelegramBot(token);
    // }

    if (!BITRIX_WEBHOOK_URL) {
      throw new Error('BITRIX_WEBHOOK_URL is missing in .env');
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const result: HealthIndicatorResult = {
      [key]: { status: 'up' as HealthIndicatorStatus },
    };

    // Проверка Bitrix
    // try {
    //   await axios.get(BITRIX_WEBHOOK_URL);
    // } catch (err) {
    //   result[key] = {
    //     status: 'down' as HealthIndicatorStatus,
    //     details: { bitrix: (err as Error).message },
    //   };
    // }
    try {
      // Health check: POST с минимальными полями, чтобы проверить авторизацию
      await axios.post(BITRIX_WEBHOOK_URL, {
        fields: {
          TITLE: 'Health Check Test',
          NAME: 'Test',
          EMAIL: [{ VALUE: 'test@example.com', VALUE_TYPE: 'WORK' }],
        },
      });
    } catch (err) {
      result[key] = {
        status: 'down' as HealthIndicatorStatus,
        details: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          bitrix: err.response?.data || (err as Error).message,
        },
      };
    }
    // Проверка Email (только соединение)
    // try {
    //   if (this.transporter) {
    //     await this.transporter.verify();
    //   }
    // } catch (err) {
    //   result[key] = {
    //     status: 'down' as HealthIndicatorStatus,
    //     details: { email: (err as Error).message },
    //   };
    // }

    // Проверка Telegram
    // try {
    //   if (this.telegramBot) {
    //     await this.telegramBot.getMe();
    //   }
    // } catch (err) {
    //   result[key] = {
    //     status: 'down' as HealthIndicatorStatus,
    //     details: { telegram: (err as Error).message },
    //   };
    // }

    if (result[key].status === 'down') {
      throw new HealthCheckError(
        'Notifications service is not healthy',
        result,
      );
    }

    return result;
  }
}
