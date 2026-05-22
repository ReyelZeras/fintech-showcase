import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from './wallet.reducer';

export const selectWalletState = createFeatureSelector<WalletState>('wallet');

export const selectBalance = createSelector(
  selectWalletState,
  (state) => state.balance
);

export const selectTransactions = createSelector(
  selectWalletState,
  (state) => state.transactions
);
