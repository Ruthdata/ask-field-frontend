export type ApiSuccess<T> = {
  data: {
    success: boolean;
    message?: string;
    data: T;
  };
};

export type ApiError = {
  success: false;
  error: string;
};
