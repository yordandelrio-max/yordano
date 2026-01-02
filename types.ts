
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface AdminUser {
  username: string;
  password: string;
  email: string;
}

export enum AppRoute {
  HOME = 'home',
  ADMIN_LOGIN = 'admin-login',
  ADMIN_DASHBOARD = 'admin-dashboard'
}
