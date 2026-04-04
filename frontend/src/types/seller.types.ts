interface ISellerOutput {
  id: string;
  name: string;
  email: string;
  organization_name: string;
}

interface ICreateSellerInput {
  name: string;
  email: string;
  password: string;
  organization_name: string;
}

interface ISellerLoginInput {
  email: string;
  password: string;
}

interface ISellerLoginOutput {
  id: string;
  access_token: string;
  access_token_expiration_date: Date;
  refresh_token_expiration_date: Date;
}

export type {
  ISellerOutput,
  ICreateSellerInput,
  ISellerLoginInput,
  ISellerLoginOutput,
};
