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
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      <header class="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center z-10">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">F</div>
          <span class="font-semibold text-lg hidden sm:block bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Fintech Showcase</span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800 transition" (click)="openProfileModal()">
<span>👤 {{ userState().fullName ? userState().fullName!.split(' ')[0] : 'Usuário' }}</span>          </div>
          <button (click)="logout()" class="text-sm text-rose-400 hover:text-rose-300 font-semibold px-2">Sair</button>
        </div>
      </header>

      <div class="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4 pointer-events-none">
        <div *ngIf="successMessage()" class="p-4 bg-emerald-900/90 border border-emerald-500 text-emerald-400 rounded-xl text-center shadow-2xl backdrop-blur-sm transition-all">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="p-4 bg-rose-900/90 border border-rose-500 text-rose-400 rounded-xl text-center shadow-2xl backdrop-blur-sm transition-all mt-2">
          {{ errorMessage() }}
        </div>
      </div>

      <main class="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-1 flex flex-col gap-6">
          <div class="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div class="flex justify-between items-center">
              <p class="text-indigo-200 text-xs font-medium uppercase tracking-wider">Saldo Disponível</p>
              <button (click)="toggleBalance()" class="text-indigo-200 hover:text-white transition">
                <svg *ngIf="showBalance()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                <svg *ngIf="!showBalance()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            </div>
            
            <h2 class="text-3xl sm:text-4xl font-bold tracking-tight mt-2 mb-6 truncate" [title]="(balance$ | async) | currency:'BRL'">
              <span *ngIf="showBalance()">{{ (balance$ | async) | currency:'BRL':'symbol':'1.2-2' }}</span>
              <span *ngIf="!showBalance()">R$ •••••••</span>
            </h2>
            
            <div class="flex gap-2">
              <button (click)="openDepositModal()" class="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2.5 rounded-xl text-sm font-medium transition">Depositar</button>
              <button (click)="openTransferModal()" class="flex-1 bg-slate-950 hover:bg-slate-900 px-3 py-2.5 rounded-xl text-sm font-medium transition">Transferir</button>
            </div>
          </div>
        </div>

        <div class="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 class="font-semibold text-lg text-white mb-4">Extrato Completo</h3>
          <div class="flex-1 overflow-y-auto max-h-[450px] space-y-3 pr-2">
            <div *ngIf="(transactions$ | async)?.length === 0" class="text-center py-12 text-slate-500 text-sm">
              Nenhuma transação efetuada.
            </div>
            <div *ngFor="let tx of (transactions$ | async)" (click)="openTxDetails(tx)" class="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition cursor-pointer">
              <div class="flex items-center gap-3">
                <div [ngClass]="{
                  'bg-emerald-500/10 text-emerald-400': tx.type === 'CREDIT',
                  'bg-rose-500/10 text-rose-400': tx.type === 'DEBIT',
                  'bg-slate-700/50 text-slate-400': tx.type === 'FAILED'
                }" class="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold">
                  {{ tx.type === 'CREDIT' ? '↓' : (tx.type === 'DEBIT' ? '↑' : '✕') }}
                </div>
                <div>
                  <p class="text-sm font-medium" [ngClass]="tx.type === 'FAILED' ? 'text-slate-400 line-through' : 'text-slate-200'">
                    {{ tx.type === 'CREDIT' ? 'Recebimento' : (tx.type === 'DEBIT' ? 'Pagamento' : 'Pix Falhou') }}
                  </p>
                  <p class="text-xs text-slate-500">{{ tx.timestamp | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
              <span [ngClass]="{
                  'text-emerald-400': tx.type === 'CREDIT',
                  'text-slate-200': tx.type === 'DEBIT',
                  'text-slate-500': tx.type === 'FAILED'
                }" class="font-semibold text-sm">
                {{ tx.type === 'CREDIT' ? '+' : '-' }} {{ tx.amount | currency:'BRL' }}
              </span>
            </div>
          </div>
        </div>
      </main>

      <div *ngIf="showDepositModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
        <div class="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-4">Realizar Depósito</h3>
          <div class="mb-5">
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
            <input type="number" [(ngModel)]="depositAmount" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
          </div>
          <div class="flex gap-3 justify-end">
            <button (click)="closeDepositModal()" class="px-4 py-2.5 text-sm text-slate-400">Cancelar</button>
            <button (click)="executeDeposit()" [disabled]="!depositAmount || isProcessing()" class="bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50">
              {{ isProcessing() ? 'Processando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="showTransferModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
        <div class="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-emerald-400 mb-4">Área Pix</h3>
          <div *ngIf="!pixConfirmationTarget()">
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chave Pix</label>
                <input type="text" [(ngModel)]="transferPixKey" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Valor (R$)</label>
                <input type="number" [(ngModel)]="transferAmount" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500">
              </div>
            </div>
            <div class="flex gap-3 justify-end">
              <button (click)="closeTransferModal()" class="px-4 py-2.5 text-sm text-slate-400">Cancelar</button>
              <button (click)="verifyPix()" [disabled]="!transferPixKey || !transferAmount || isProcessing()" class="bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50">
                 {{ isProcessing() ? 'Buscando...' : 'Continuar' }}
              </button>
            </div>
          </div>
          <div *ngIf="pixConfirmationTarget()">
            <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 text-center">
              <p class="text-xs text-slate-500">Enviando para</p>
              <p class="font-bold text-xl text-white my-1">{{ pixConfirmationTarget()?.fullName }}</p>
              <p class="font-bold text-3xl text-emerald-400 mt-2">{{ transferAmount | currency:'BRL' }}</p>
            </div>
            <div class="flex gap-3 justify-end">
              <button (click)="pixConfirmationTarget.set(null)" class="px-4 py-2.5 text-sm text-slate-400">Voltar</button>
              <button (click)="executeTransfer()" [disabled]="isProcessing()" class="bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50">
                {{ isProcessing() ? 'Processando...' : 'Confirmar Pix' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="selectedTx()" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
        <div class="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl text-center">
          <div [ngClass]="{'bg-emerald-500/10 text-emerald-400': selectedTx()?.type === 'CREDIT', 'bg-rose-500/10 text-rose-400': selectedTx()?.type === 'DEBIT', 'bg-slate-700/50 text-slate-400': selectedTx()?.type === 'FAILED'}" class="w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {{ selectedTx()?.type === 'CREDIT' ? '↓' : (selectedTx()?.type === 'DEBIT' ? '↑' : '✕') }}
          </div>
          <h3 class="text-xl font-bold text-white">{{ selectedTx()?.type === 'CREDIT' ? 'Transferência Recebida' : (selectedTx()?.type === 'DEBIT' ? 'Transferência Enviada' : 'Falha na Transação') }}</h3>
          <p class="text-3xl font-bold mt-4 mb-1" [ngClass]="selectedTx()?.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-200'">
             {{ selectedTx()?.amount | currency:'BRL' }}
          </p>
          <p class="text-sm text-slate-400 mb-6">{{ selectedTx()?.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</p>
          
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 text-left mb-6">
            <p class="text-xs text-slate-500">Contraparte:</p>
            <p class="text-sm font-medium text-white">{{ selectedTx()?.counterpartName || 'Usuário Fintech' }}</p>
            <p class="text-xs text-slate-500 mt-2">ID Transação:</p>
            <p class="text-[10px] text-slate-400 font-mono break-all">{{ selectedTx()?.id }}</p>
          </div>
          <button (click)="selectedTx.set(null)" class="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-sm font-medium text-white transition">Fechar</button>
        </div>
      </div>

      <div *ngIf="showProfileModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
        <div class="bg-slate-900 border border-slate-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl">
          <h3 class="text-xl font-bold text-white mb-6">Meu Perfil</h3>
          
          <div class="space-y-4 mb-6">
            <div class="relative group">
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
              <div class="flex items-center gap-2">
                <input [readonly]="!isEditingProfile()" type="text" [(ngModel)]="editProfileData.fullName" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" [ngClass]="{'opacity-70': !isEditingProfile()}">
                <button *ngIf="!isEditingProfile()" (click)="isEditingProfile.set(true)" class="text-slate-500 hover:text-indigo-400">✏️</button>
              </div>
            </div>
            
            <div class="relative group">
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sua Chave Pix</label>
              <div class="flex items-center gap-2">
                <input [readonly]="!isEditingProfile()" type="text" [(ngModel)]="editProfileData.pixKey" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" [ngClass]="{'opacity-70': !isEditingProfile()}">
                <button *ngIf="!isEditingProfile()" (click)="isEditingProfile.set(true)" class="text-slate-500 hover:text-indigo-400">✏️</button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-mail (Não Editável)</label>
              <input readonly type="email" [value]="userState().email" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 opacity-50 cursor-not-allowed">
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button *ngIf="isEditingProfile()" (click)="updateProfile()" [disabled]="isProcessing()" class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-sm font-medium text-white transition disabled:opacity-50">Salvar Alterações</button>
            <button *ngIf="!isEditingProfile()" (click)="showDeleteConfirmModal = true; showProfileModal = false" class="w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/50 py-3 rounded-xl text-sm font-medium transition">Excluir Conta</button>
            <button (click)="closeProfile()" class="w-full text-slate-400 hover:text-white py-2 text-sm transition">Fechar</button>
          </div>
        </div>
      </div>

      <div *ngIf="showDeleteConfirmModal" class="fixed inset-0 bg-rose-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
        <div class="bg-slate-900 border border-rose-800 max-w-sm w-full rounded-2xl p-6 shadow-2xl text-center">
          <div class="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
          <h3 class="text-xl font-bold text-white mb-2">Excluir Conta?</h3>
          <p class="text-sm text-slate-400 mb-6">Essa ação desativará seu acesso e congelará seu saldo.</p>
          <div class="flex gap-3 justify-center">
            <button (click)="showDeleteConfirmModal = false; showProfileModal = true" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium text-white transition">Cancelar</button>
            <button (click)="deleteAccount()" [disabled]="isProcessing()" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-sm font-medium text-white transition disabled:opacity-50">Sim, Excluir</button>
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

  userState = this.authService.currentUser;
  currentWalletId = this.userState().walletId || '';

  showTransferModal = false;
  showDepositModal = false;
  showProfileModal = false;
  showDeleteConfirmModal = false;
  showBalance = signal(true);
  isEditingProfile = signal(false);
  isProcessing = signal(false); // Trava de clicks duplos
  
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  transferPixKey = '';
  transferAmount: number | null = null;
  depositAmount: number | null = null;
  editProfileData = { fullName: '', pixKey: '' };

  pixConfirmationTarget = signal<{fullName: string} | null>(null);
  selectedTx = signal<any | null>(null);

  constructor() {
    this.balance$ = this.store.select(selectBalance);
    this.transactions$ = this.store.select(selectTransactions);
  }

  ngOnInit(): void {
    if (this.currentWalletId) this.walletService.fetchDashboardData(this.currentWalletId);
  }

  logout() { this.authService.logout(); }
  toggleBalance() { this.showBalance.update(v => !v); }
  
  openProfileModal() { 
    this.editProfileData.fullName = this.userState().fullName || '';
    this.editProfileData.pixKey = this.userState().pixKey || '';
    this.isEditingProfile.set(false);
    this.showProfileModal = true; 
  }
  closeProfile() { this.showProfileModal = false; this.isEditingProfile.set(false); }
  
  openTransferModal() { this.showTransferModal = true; }
  closeTransferModal() { 
    this.showTransferModal = false;
    this.pixConfirmationTarget.set(null);
    this.clearForms();
  }

  openDepositModal() { this.showDepositModal = true; }
  closeDepositModal() { this.showDepositModal = false; this.clearForms(); }

  openTxDetails(tx: any) { this.selectedTx.set(tx); }

  clearForms() {
    this.transferPixKey = '';
    this.transferAmount = null;
    this.depositAmount = null;
    this.isProcessing.set(false);
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

  verifyPix() {
    if (!this.transferPixKey) return;
    this.isProcessing.set(true);
    this.walletService.verifyPixKey(this.transferPixKey).subscribe({
      next: (res) => {
        this.pixConfirmationTarget.set(res);
        this.isProcessing.set(false);
      },
      error: () => {
        this.showFeedback('Chave Pix não encontrada.', true);
        this.isProcessing.set(false);
      }
    });
  }

  executeTransfer() {
    if (!this.transferPixKey || !this.transferAmount || this.transferAmount <= 0 || this.isProcessing()) return;
    this.isProcessing.set(true);
    
    this.walletService.transfer({
      sourceWalletId: this.currentWalletId,
      pixKey: this.transferPixKey,
      amount: this.transferAmount
    }).subscribe({
      next: () => {
        this.closeTransferModal();
        this.showFeedback('Pix enviado com sucesso!');
        this.walletService.fetchDashboardData(this.currentWalletId); // Atualiza pra quem envia!
      },
      error: (err: any) => {
        this.closeTransferModal();
        this.showFeedback(err.error?.message || err.error || 'Erro ao realizar Pix', true);
        this.walletService.fetchDashboardData(this.currentWalletId);
      }
    });
  }

  executeDeposit() {
    if (!this.depositAmount || this.depositAmount <= 0 || this.isProcessing()) return;
    this.isProcessing.set(true);
    
    this.walletService.deposit({
      walletId: this.currentWalletId,
      amount: this.depositAmount
    }).subscribe({
      next: () => {
        this.closeDepositModal();
        this.showFeedback('Depósito compensado em sua conta!');
      },
      error: () => {
        this.closeDepositModal();
        this.showFeedback('Erro ao realizar depósito.', true);
      }
    });
  }

  updateProfile() {
    this.isProcessing.set(true);
    this.walletService.updateProfile(this.editProfileData).subscribe({
      next: (res) => {
        // Atualiza o local storage para não perder no F5
        localStorage.setItem('fullName', res.fullName);
        localStorage.setItem('pixKey', res.pixKey);
        // Atualiza a tela
        this.closeProfile();
        this.showFeedback('Perfil atualizado com sucesso!');
        this.isProcessing.set(false);
      },
      error: () => {
        this.showFeedback('Erro ao atualizar perfil.', true);
        this.isProcessing.set(false);
      }
    });
  }

  deleteAccount() {
    this.isProcessing.set(true);
    this.walletService.deactivateAccount().subscribe({
      next: () => {
        this.showDeleteConfirmModal = false;
        this.logout();
      }
    });
  }
}