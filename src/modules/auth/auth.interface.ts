export interface IRegisterUser {
  name: string;
  email: string;
  password: string;
  phone?: string;
  profileImage?: string;
  role: "CUSTOMER" | "PROVIDER";
}
