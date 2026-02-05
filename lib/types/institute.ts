export interface Institute {
  _id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InstituteFormData {
  name: string;
  email: string;
  address?: string;
  phone?: string;
  password?: string; // for create
}
