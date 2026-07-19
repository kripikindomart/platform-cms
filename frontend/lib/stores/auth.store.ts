/**
 * Auth Store
 * Global authentication state management using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  name?: string;
  is_verified: boolean;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false, // Changed to false by default

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false
      }),

      setToken: (token) => set({ token }),

      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true,
        isLoading: false 
      }),

      logout: () => {
        // Clear token from storage
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false
        });
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      checkAuth: () => {
        const state = get();
        const isAuth = state.isAuthenticated && !!state.token;
        
        // Ensure isLoading is false after check
        if (state.isLoading) {
          set({ isLoading: false });
        }
        
        return isAuth;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
