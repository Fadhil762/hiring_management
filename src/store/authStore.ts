import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  userId: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,
      userId: null,
      
      login: async (username: string, password: string) => {
        try {
          // Fetch user from database
          const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .eq('is_active', true)
            .single();

          if (error || !user) {
            console.error('User not found:', error);
            return false;
          }

          // Verify password using bcrypt
          const isPasswordValid = await bcrypt.compare(password, user.password_hash);

          if (isPasswordValid) {
            set({ 
              isAuthenticated: true, 
              username: user.username,
              userId: user.id 
            });
            return true;
          }

          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      logout: () => {
        set({ isAuthenticated: false, username: null, userId: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
