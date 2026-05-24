import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { selectBalance, selectTransactions } from '../../core/state/wallet.selectors';
import { WalletService } from '../../core/services/wallet.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header class="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">F</div>
          <span class="font-semibold text-lg tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Fintech Showcase</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Olá, {{ currentUser() }}</span>
          </div>
          <button (click)="logout()" class="text-sm text-rose-400 hover:text-rose-300 font-semibold">Sair</button>
        </div>
      </header>

      <div class="max-w-6xl w-full mx-auto px-6 mt-4">
        <div *ngIf="successMessage()" class="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center font-medium shadow-lg transition-all">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-center font-medium shadow-lg transition-all mt-2">
          {{ errorMessage() }}
        </div>
      </div>

      <main class="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1 flex flex-col gap-6">
          <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <p class="text-indigo-200 text-xs font-medium uppercase tracking-wider">Saldo Disponível</p>
            <h2 class="text-4xl font-bold tracking-tight mt-2 mb-6">
              {{ (balance$ | async) | currency:'BRL':'symbol':'1.2-2' }}
            </h2>
            <div class="flex gap-3">
              <button (click)="openDepositModal()" class="flex-1 bg-white/10 hover:bg-white/20 transition px-4 py-2.5 rounded-xl text-sm font-medium">
                ▲ Depositar
              </button>
              <button (click)="openTransferModal()" class="flex-1 bg-slate-950 hover:bg-slate-900 transition px-4 py-2.5 rounded-xl text-sm font-medium">
                Transferir Pix
              </button>
            </div>
          </div>
        </div>

        <div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 class="font-semibold text-lg text-white mb-4">Extrato Completo</h3>
          <div class="flex-1 overflow-y-auto max-h-[450px] space-y-3 pr-2">
            <div *ngIf="(transactions$ | async)?.length === 0" class="text-center py-12 text-slate-500 text-sm">
              Nenhuma transação efetuada até o momento.
            </div>
            <div *ngFor="let tx of (transactions$ | async)" class="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition">
              <div class="flex items-center gap-3">
                <div [ngClass]="tx.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'" class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold">
                  {{ tx.type === 'CREDIT' ? '↓' : '↑' }}
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-200">{{ tx.type === 'CREDIT' ? 'Recebimento' : 'Pagamento' }}</p>
                  <p class="text-xs text-slate-500">{{ tx.timestamp | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
              <span [ngClass]="tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-200'" class="font-semibold text-sm">
                {{ tx.type === 'CREDIT' ? '+' : '-' }} {{ tx.amount | currency:'BRL' }}
              </span>
            </div>
          </div>
        </div>
      </main>

      <div *ngIf="showDepositModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-2">Realizar Depósito</h3>
          <div class="mb-5">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
            <input type="number" [(ngModel)]="depositAmount" placeholder="0,00" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
          </div>
          <div class="flex gap-3 justify-end">
            <button (click)="closeDepositModal()" class="px-4 py-2.5 text-sm text-slate-400 hover:text-white">Cancelar</button>
            <button (click)="executeDeposit()" class="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white">Confirmar</button>
          </div>
        </div>
      </div>

      <div *ngIf="showTransferModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-emerald-400 mb-2">Área Pix</h3>
          <p class="text-sm text-slate-400 mb-6">Transfira de forma instantânea.</p>
          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chave Pix de Destino</label>
              <input type="text" [(ngModel)]="transferPixKey" placeholder="E-mail, CPF ou Celular" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
              <input type="number" [(ngModel)]="transferAmount" placeholder="0,00" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button (click)="closeTransferModal()" class="px-4 py-2.5 text-sm text-slate-400 hover:text-white">Cancelar</button>
            <button (click)="executeTransfer()" class="bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white">Enviar Pix</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  balance$: Observable<number>;
  transactions$: Observable<any[]>;

  private store = inject(Store);
  private walletService = inject(WalletService);
  private authService = inject(AuthService);

  currentWalletId = this.authService.currentUser().walletId || '';
  currentUser = signal(this.authService.currentUser().fullName || 'Usuário');

  showTransferModal = false;
  showDepositModal = false;
  
  // Feedback Messages
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  transferPixKey = ''; // Agora usa Chave Pix
  transferAmount: number | null = null;
  depositAmount: number | null = null;

  constructor() {
    this.balance$ = this.store.select(selectBalance);
    this.transactions$ = this.store.select(selectTransactions);
  }

  ngOnInit(): void {
    if (this.currentWalletId) {
      this.walletService.fetchDashboardData(this.currentWalletId);
    }
  }

  logout() {
    this.authService.logout();
  }

  openTransferModal() { this.showTransferModal = true; }
  closeTransferModal() { 
    this.showTransferModal = false;
    this.clearForms();
  }

  openDepositModal() { this.showDepositModal = true; }
  closeDepositModal() { 
    this.showDepositModal = false;
    this.clearForms();
  }

  clearForms() {
    this.transferPixKey = '';
    this.transferAmount = null;
    this.depositAmount = null;
  }

  showFeedback(message: string, isError = false) {
    if (isError) {
      this.errorMessage.set(message);
      setTimeout(() => this.errorMessage.set(null), 4000);
    } else {
      this.successMessage.set(message);
      setTimeout(() => this.successMessage.set(null), 4000);
    }
  }

  executeTransfer() {
    if (!this.transferPixKey || !this.transferAmount || this.transferAmount <= 0) return;
    
    this.walletService.transfer({
      sourceWalletId: this.currentWalletId,
      pixKey: this.transferPixKey,
      amount: this.transferAmount
    }).subscribe({
      next: () => {
        this.closeTransferModal();
        this.showFeedback('Transferência Pix enviada com sucesso!');
      },
      error: (err: any) => {
        this.closeTransferModal();
        this.showFeedback(err.error?.message || err.error || 'Erro ao realizar Pix', true);
      }
    });
  }

  executeDeposit() {
    if (!this.depositAmount || this.depositAmount <= 0) return;
    
    this.walletService.deposit({
      walletId: this.currentWalletId,
      amount: this.depositAmount
    }).subscribe({
      next: () => {
        this.closeDepositModal();
        this.showFeedback('Depósito compensado em sua conta!');
      },
      error: (err: any) => {
        this.closeDepositModal();
        this.showFeedback('Erro ao realizar depósito.', true);
      }
    });
  }
}