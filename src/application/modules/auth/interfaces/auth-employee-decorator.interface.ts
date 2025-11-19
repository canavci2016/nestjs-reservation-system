export interface AuthUserDecoratorInterface {
  sub: string;
  username: string;
  user: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    userName: string;
    phone: string;
    companyId: string;
  };
}
