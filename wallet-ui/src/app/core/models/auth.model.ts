export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  pixKey: string;
}

export interface TokenResponse {
  token: string;
  fullName: string;
  email: string; // Adicionado
  pixKey: string; // Adicionado
  walletId: string;
}

export interface UserState {
  fullName: string | null;
  email: string | null; // Adicionado
  pixKey: string | null; // Adicionado
  walletId: string | null;
  isAuthenticated: boolean;
}