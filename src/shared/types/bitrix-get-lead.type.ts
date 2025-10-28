import { BitrixCurrency, LeadStatus, ProcessedStatusEnum } from '../enums';
import { BitrixLeadContactField } from './bitrix-contact.type';

export type BitrixLead = {
  ID: string;
  TITLE: string;
  NAME?: string;
  LAST_NAME?: string;
  EMAIL?: BitrixLeadContactField[];
  PHONE?: BitrixLeadContactField[];
  UF_CRM_CREATED_BY_API?: boolean;
  OPPORTUNITY?: string;
  CURRENCY_ID?: BitrixCurrency;
  STATUS_SEMANTIC_ID?: keyof typeof ProcessedStatusEnum;
  STATUS_ID?: keyof typeof LeadStatus;
  // добавь другие поля по необходимости
};
