import { Component, inject, signal, computed, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop'; // IMPORTANTE

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div class="bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-800">
        <h2 class="text-3xl font-bold text-white mb-6 text-center">
          {{ isLoginMode() ? 'Acesse sua Conta' : 'Crie sua Conta' }}
        </h2>

        <form *ngIf="isLoginMode()" [formGroup]="loginForm" (ngSubmit)="onSubmitLogin()" class="space-y-4">
          <div>
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">E-mail</label>
            <input type="email" formControlName="email" placeholder="seu@email.com" 
                   class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Senha</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" 
                     class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
              <button type="button" (click)="togglePassword()" class="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400">
                <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading()" 
                  class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 mt-4">
            {{ isLoading() ? 'Aguarde...' : 'Entrar' }}
          </button>
        </form>

        <form *ngIf="!isLoginMode()" [formGroup]="registerForm" (ngSubmit)="onSubmitRegister()" class="space-y-4">
          <div>
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Nome Completo</label>
            <input type="text" formControlName="fullName" placeholder="Ex: Reyel Soares" 
                   class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
          </div>

          <div>
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">E-mail</label>
            <input type="email" formControlName="email" placeholder="seu@email.com" 
                   class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Chave Pix</label>
            <input type="text" formControlName="pixKey" placeholder="CPF, Celular, E-mail ou Aleatória" 
                   class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Senha</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Mínimo 8 caracteres" 
                     class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
              <button type="button" (click)="togglePassword()" class="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400">
                <svg *ngIf="!showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg *ngIf="showPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              </button>
            </div>
            
            <div *ngIf="registerForm.get('password')?.value" class="mt-2 flex items-center gap-2">
              <div class="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full transition-all duration-300" [ngClass]="{'w-1/3 bg-rose-500': passwordStrength() === 'Fraca', 'w-2/3 bg-amber-500': passwordStrength() === 'Média', 'w-full bg-emerald-500': passwordStrength() === 'Forte'}"></div>
              </div>
              <span class="text-xs font-medium" [ngClass]="{'text-rose-500': passwordStrength() === 'Fraca', 'text-amber-500': passwordStrength() === 'Média', 'text-emerald-500': passwordStrength() === 'Forte'}">{{ passwordStrength() }}</span>
            </div>
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Repita a Senha</label>
            <div class="relative">
              <input [type]="showConfirmPassword() ? 'text' : 'password'" formControlName="confirmPassword" placeholder="Confirme sua senha" 
                     class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
              <button type="button" (click)="toggleConfirmPassword()" class="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400">
                <svg *ngIf="!showConfirmPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <svg *ngIf="showConfirmPassword()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              </button>
            </div>
            <span *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched" class="text-rose-500 text-xs mt-1 block">
              As senhas não coincidem.
            </span>
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isLoading()" 
                  class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 mt-4">
            {{ isLoading() ? 'Aguarde...' : 'Criar Conta' }}
          </button>
        </form>

        <p class="text-center text-slate-400 mt-6 text-sm">
          {{ isLoginMode() ? 'Ainda não é cliente?' : 'Já possui conta?' }}
          <button (click)="toggleMode()" class="text-indigo-400 hover:text-indigo-300 font-semibold ml-1 transition-colors">
            {{ isLoginMode() ? 'Abra sua conta' : 'Faça Login' }}
          </button>
        </p>

        <div *ngIf="errorMessage()" class="mt-5 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-center text-sm">
          {{ errorMessage() }}
        </div>
        <div *ngIf="successMessage()" class="mt-5 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center text-sm">
          {{ successMessage() }}
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  

  isLoginMode = signal(true);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null); // Novo signal para banner de sucesso
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<string>(''); // Mudamos para signal simples

  private pixRegex = /^(\d{11}|\d{14}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+[1-9]\d{1,14}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    pixKey: ['', [Validators.required, Validators.pattern(this.pixRegex)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor() {
    // Escuta as mudanças da senha e atualiza o Signal manualmente
    this.registerForm.get('password')?.valueChanges.subscribe(pass => {
      this.calculateStrength(pass || '');
    });
  }

  passwordChanges = toSignal(this.registerForm.controls['password'].valueChanges, { initialValue: '' });
  
  calculateStrength(pass: string) {
    if (!pass) {
      this.passwordStrength.set('');
      return;
    }
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) this.passwordStrength.set('Fraca');
    else if (score === 2 || score === 3) this.passwordStrength.set('Média');
    else this.passwordStrength.set('Forte');
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleMode() {
    this.isLoginMode.update(mode => !mode);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loginForm.reset();
    this.registerForm.reset();
    this.showPassword.set(false);
    this.showConfirmPassword.set(false);
  }

  togglePassword() { this.showPassword.update(v => !v); }
  toggleConfirmPassword() { this.showConfirmPassword.update(v => !v); }

  onSubmitLogin() {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => {
        this.errorMessage.set('Credenciais inválidas. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  onSubmitRegister() {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.registerForm.value as any).subscribe({
      next: () => {
        this.successMessage.set('Conta criada com sucesso! Redirecionando...');
        
        // Atrasa 2 segundos para o usuário ler a mensagem, depois alterna para a tela de login
        setTimeout(() => {
          this.toggleMode();
          this.isLoading.set(false);
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage.set(err.error || 'Erro interno ao criar conta.');
        this.isLoading.set(false);
      }
    });
  }
}