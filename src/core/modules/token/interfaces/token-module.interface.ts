export interface ICoreTokenModuleOptions {
  secret: string;
  jwtExpires: { unit: 'minute' | 'hour'; amount: number };
}
