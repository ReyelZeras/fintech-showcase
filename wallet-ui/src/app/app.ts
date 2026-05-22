import { Component, OnInit } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectBalance, selectTransactions } from './state/wallet.selectors';
import { WalletService } from './services/wallet.service';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  balance$: Observable<number>;
  transactions$: Observable<any[]>;

  // Ajustado para o ID real inserido no V3__seed_initial_wallets.sql ("Reyel Soares")
  currentWalletId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';

  showTransferModal = false;
  showDepositModal = false;

  transferTarget = '';
  transferAmount: number | null = null;
  depositAmount: number | null = null;

  constructor(
    private store: Store,
    private walletService: WalletService
  ) {
    this.balance$ = this.store.select(selectBalance);
    this.transactions$ = this.store.select(selectTransactions);
  }

  ngOnInit(): void {
    this.walletService.fetchDashboardData(this.currentWalletId);
  }

  openTransferModal() { this.showTransferModal = true; }
  closeTransferModal() { this.showTransferModal = false; this.clearForms(); }

  openDepositModal() { this.showDepositModal = true; }
  closeDepositModal() { this.showDepositModal = false; this.clearForms(); }

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
      error: (err) => alert('Erro na transferência: ' + (err.error?.message || err.message))
    });
  }

  executeDeposit() {
    if (!this.depositAmount || this.depositAmount <= 0) return;

    this.walletService.deposit({
      walletId: this.currentWalletId,
      amount: this.depositAmount
    }).subscribe({
      next: () => this.closeDepositModal(),
      error: (err) => alert('Erro no depósito: ' + (err.error?.message || err.message))
    });
  }
}
