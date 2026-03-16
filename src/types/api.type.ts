export type ApiSuccess<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export type ApiError = {
  success: false;
  error: string;
};
