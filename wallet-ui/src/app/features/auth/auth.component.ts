import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

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
            <span *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="text-rose-500 text-xs mt-1 block">
              E-mail inválido.
            </span>
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Senha</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="••••••••" 
                     class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
              <button type="button" (click)="togglePassword()" class="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400">
                <span *ngIf="!showPassword()">👁️</span>
                <span *ngIf="showPassword()">🙈</span>
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
            <span *ngIf="registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid" class="text-rose-500 text-xs mt-1 block">
              Nome é obrigatório.
            </span>
          </div>

          <div>
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">E-mail</label>
            <input type="email" formControlName="email" placeholder="seu@email.com" 
                   class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
            <span *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.invalid" class="text-rose-500 text-xs mt-1 block">
              Insira um e-mail válido.
            </span>
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Chave Pix</label>
            <input type="text" formControlName="pixKey" placeholder="CPF, Celular, E-mail ou Aleatória" 
                   class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
            <span *ngIf="registerForm.get('pixKey')?.touched && registerForm.get('pixKey')?.invalid" class="text-rose-500 text-xs mt-1 block">
              Formato de chave Pix inválido.
            </span>
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Senha</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Mínimo 8 caracteres" 
                     class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
              <button type="button" (click)="togglePassword()" class="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400">
                <span *ngIf="!showPassword()">👁️</span>
                <span *ngIf="showPassword()">🙈</span>
              </button>
            </div>
            
            <div *ngIf="registerForm.get('password')?.value" class="mt-2 flex items-center gap-2">
              <div class="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full transition-all duration-300" 
                     [ngClass]="{
                       'w-1/3 bg-rose-500': passwordStrength() === 'Fraca',
                       'w-2/3 bg-amber-500': passwordStrength() === 'Média',
                       'w-full bg-emerald-500': passwordStrength() === 'Forte'
                     }">
                </div>
              </div>
              <span class="text-xs font-medium" 
                    [ngClass]="{
                      'text-rose-500': passwordStrength() === 'Fraca',
                      'text-amber-500': passwordStrength() === 'Média',
                      'text-emerald-500': passwordStrength() === 'Forte'
                    }">
                {{ passwordStrength() }}
              </span>
            </div>
          </div>

          <div class="relative">
            <label class="block text-slate-400 mb-1 text-xs font-semibold uppercase tracking-wider">Repita a Senha</label>
            <div class="relative">
              <input [type]="showConfirmPassword() ? 'text' : 'password'" formControlName="confirmPassword" placeholder="Confirme sua senha" 
                     class="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors">
              <button type="button" (click)="toggleConfirmPassword()" class="absolute right-4 top-3.5 text-slate-500 hover:text-indigo-400">
                <span *ngIf="!showConfirmPassword()">👁️</span>
                <span *ngIf="showConfirmPassword()">🙈</span>
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
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  // Regex robusta do Bacen para aceitar: CPF (11), CNPJ (14), Celular (+55...), E-mail ou UUID.
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

  // Sinal computado para analisar a força da senha em tempo real
  passwordStrength = computed(() => {
    const pass = this.registerForm.get('password')?.value || '';
    if (!pass) return '';
    let score = 0;
    if (pass.length >= 8) score++; // Mínimo de caracteres
    if (/[A-Z]/.test(pass)) score++; // Tem maiúscula
    if (/[0-9]/.test(pass)) score++; // Tem número
    if (/[^A-Za-z0-9]/.test(pass)) score++; // Tem caractere especial

    if (score <= 1) return 'Fraca';
    if (score === 2 || score === 3) return 'Média';
    return 'Forte';
  });

  // Validador customizado para conferir se as senhas são idênticas
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
        alert('Conta criada com sucesso! Faça login para continuar.');
        this.toggleMode();
        this.isLoading.set(false);
      },
      error: (err: any) => {
        // Exibe a mensagem de erro específica que o backend mandou (ex: "E-mail já cadastrado")
        this.errorMessage.set(err.error || 'Erro interno ao criar conta.');
        this.isLoading.set(false);
      }
    });
  }
}