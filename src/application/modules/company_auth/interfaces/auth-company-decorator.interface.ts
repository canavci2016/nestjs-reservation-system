export interface AuthCompanyDecoratorInterface {
  sub: string;
  username: string;
  company: {
    id: string;
    name: string;
    tax: string;
    isActive: boolean;
    userName: string;
    secretKey: string;
    enableUserPackageSystem: boolean;
  };
}
