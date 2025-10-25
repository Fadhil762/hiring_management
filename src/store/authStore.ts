import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Simple credential check (in production, use proper backend auth)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'rakaminenter2020',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      
      login: (username: string, password: string) => {
        if (
          username === ADMIN_CREDENTIALS.username &&
          password === ADMIN_CREDENTIALS.password
        ) {
          set({ isAuthenticated: true, username });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ isAuthenticated: false, username: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
