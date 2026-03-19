export type ApiSuccess<T> = {
    success: boolean;
    message?: string;
    data: T;
};

export type ApiError = {
  success: false;
  error: string;
};


export interface JwtApiError {
  status: number;
  data: {
    message: {
      name: string;
      // add other message properties if needed
    };
  };
}
