import { BitrixCurrency } from '../enums';

export type BitrixPayload = {
  applicationId: number;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  opportunity?: number; // сумма сделки или потенциал
  currency_id?: BitrixCurrency;
};
