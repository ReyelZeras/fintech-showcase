import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginPayload, RegisterPayload, TokenResponse, UserState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // CORREÇÃO: Apontando explicitamente para a porta 8080 do Spring Boot
  private apiUrl = 'http://localhost:8080/api/auth'; 

  private state = signal<UserState>({
    fullName: null,
    walletId: null,
    isAuthenticated: false,
    email: null,
    pixKey: null
  });

  public currentUser = computed(() => this.state());
  public isAuthenticated = computed(() => this.state().isAuthenticated);

  constructor() {
    this.checkInitialState();
  }

private checkInitialState() {
    const token = localStorage.getItem('token');
    const fullName = localStorage.getItem('fullName');
    const email = localStorage.getItem('email');
    const pixKey = localStorage.getItem('pixKey');
    const walletId = localStorage.getItem('walletId');

    if (token && fullName && walletId) {
      this.state.set({ fullName, email, pixKey, walletId, isAuthenticated: true });
    }
  }
login(payload: LoginPayload) {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('fullName', response.fullName);
        localStorage.setItem('email', response.email);
        localStorage.setItem('pixKey', response.pixKey);
        localStorage.setItem('walletId', response.walletId);
        this.state.set({ 
          fullName: response.fullName, 
          email: response.email, 
          pixKey: response.pixKey, 
          walletId: response.walletId, 
          isAuthenticated: true 
        });
      })
    );
  }

  register(payload: RegisterPayload) {
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  logout() {
    localStorage.clear();
    this.state.set({
      fullName: null, walletId: null, isAuthenticated: false,
      email: null,
      pixKey: null
    });
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}