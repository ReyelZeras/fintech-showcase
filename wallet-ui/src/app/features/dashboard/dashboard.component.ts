import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectBalance, selectTransactions } from '../../core/state/wallet.selectors';
import { WalletService } from '../../core/services//wallet.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../../app.html', // Reutilizando o HTML do seu escopo original
  styleUrls: ['../../app.scss']
})
export class DashboardComponent implements OnInit {
  balance$: Observable<number>;
  transactions$: Observable<any[]>;

  private store = inject(Store);
  private walletService = inject(WalletService);
  private authService = inject(AuthService);

  // Pega o ID dinamicamente da sessão de autenticação
  currentWalletId = this.authService.currentUser().walletId || '';

  showTransferModal = false;
  showDepositModal = false;

  transferTarget = '';
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
    this.transferTarget = '';
    this.transferAmount = null;
    this.depositAmount = null;
  }

  executeTransfer() {
    if (!this.transferTarget || !this.transferAmount || this.transferAmount <= 0) return;
    this.walletService.transfer({
      sourceWalletId: this.currentWalletId,
      destinationWalletId: this.transferTarget,
      amount: this.transferAmount
    }).subscribe({
      next: () => this.closeTransferModal(),
      error: (err: any) => alert('Erro na transferência: ' + (err.error?.message || err.message))
    });
  }

  executeDeposit() {
    if (!this.depositAmount || this.depositAmount <= 0) return;
    this.walletService.deposit({
      walletId: this.currentWalletId,
      amount: this.depositAmount
    }).subscribe({
      next: () => this.closeDepositModal(),
      error: (err: any) => alert('Erro no depósito: ' + (err.error?.message || err.message))
    });
  }
}