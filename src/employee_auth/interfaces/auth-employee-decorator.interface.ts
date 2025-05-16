export interface AuthEmployeeDecoratorInterface {
  sub: string;
  username: string;
  employee: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    userName: string;
    phone: string;
    companyId: string;
  };
}
