export type BitrixResponse<T> = {
  result: T;
  error?: string;
  [key: string]: any; // на случай дополнительных полей
};
