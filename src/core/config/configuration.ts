export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d',
  },
  mail: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  bitrix: {
    webhookUrl: process.env.BITRIX_WEBHOOK_URL,
    webhookUrlGetLead: process.env.BITRIX_WEBHOOK_URL_GET_LEAD,
  },
});
