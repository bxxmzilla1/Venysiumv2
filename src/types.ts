export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ParamLocation = 'path' | 'query' | 'body' | 'header';

export type ParamType = 'string' | 'integer' | 'boolean' | 'array';

export interface ApiParam {
  name: string;
  in: ParamLocation;
  required: boolean;
  type: ParamType;
  description: string;
  example?: string;
  default?: string;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
  params: ApiParam[];
  scopes?: string[];
}

export interface ApiSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export interface ApiResponse {
  status: number;
  statusText: string;
  data: unknown;
  duration: number;
  error?: string;
}
