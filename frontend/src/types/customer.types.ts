interface ICustomerOutput {
  id: string;
  name: string;
  email: string;
}

interface ICreateCustomerInput {
  name: string;
  email: string;
  password: string;
}

interface ICustomerLoginInput {
  email: string;
  password: string;
}

interface ICustomerLoginOutput {
  id: string;
  access_token: string;
  access_token_expiration_date: Date;
  refresh_token_expiration_date: Date;
}

export type {
  ICustomerOutput,
  ICreateCustomerInput,
  ICustomerLoginInput,
  ICustomerLoginOutput,
};
