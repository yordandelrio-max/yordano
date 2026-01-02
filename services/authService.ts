
import { AdminUser } from '../types';

const ADMIN_STORAGE_KEY = 'geofinder_admins';

const DEFAULT_ADMIN: AdminUser = {
  username: 'yordan',
  password: 'delrio99',
  email: 'ydelrio@tribu.cl'
};

export const authService = {
  getAdmins: (): AdminUser[] => {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify([DEFAULT_ADMIN]));
      return [DEFAULT_ADMIN];
    }
    return JSON.parse(stored);
  },

  addAdmin: (user: AdminUser): void => {
    const admins = authService.getAdmins();
    if (admins.some(a => a.username === user.username)) {
      throw new Error("El nombre de usuario ya existe");
    }
    admins.push(user);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
  },

  deleteAdmin: (username: string): void => {
    const admins = authService.getAdmins();
    if (admins.length <= 1) {
      throw new Error("No se puede eliminar la última cuenta de administrador");
    }
    const filtered = admins.filter(a => a.username !== username);
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(filtered));
  },

  authenticate: (user: string, pass: string): boolean => {
    const admins = authService.getAdmins();
    return admins.some(a => a.username === user && a.password === pass);
  }
};
