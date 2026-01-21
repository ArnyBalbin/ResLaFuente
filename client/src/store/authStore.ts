import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '../types';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  setAuth: (token: string, usuario: Usuario) => void;
  updateUser: (usuario: Usuario) => void; 
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      
      setAuth: (token, usuario) => set({ token, usuario }),
      
      // Implementación de la nueva acción
      updateUser: (usuario) => set({ usuario }), 
      
      logout: () => set({ token: null, usuario: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
);