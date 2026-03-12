export type ApiSuccess<T> = {
    success: boolean;
    data: T;
    message?: string;
  };