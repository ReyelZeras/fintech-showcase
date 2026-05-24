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
  walletId: string;
}

export interface UserState {
  fullName: string | null;
  walletId: string | null;
  isAuthenticated: boolean;
}