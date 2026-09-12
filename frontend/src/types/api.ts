export interface ApiProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  [key: string]: unknown;
}

export interface HealthStatus {
  status: string;
  environment: string;
  database: string;
  timestamp: string;
  version: string;
}
