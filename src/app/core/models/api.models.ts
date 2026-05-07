export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
}
