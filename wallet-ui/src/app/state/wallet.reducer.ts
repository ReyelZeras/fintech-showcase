import { createReducer, on } from '@ngrx/store';
import * as WalletActions from './wallet.actions';

export interface WalletState {
  balance: number;
  transactions: any[];
  loading: boolean;
}

export const initialState: WalletState = {
  balance: 0.0,
  transactions: [],
  loading: false
};

export const walletReducer = createReducer(
  initialState,
  on(WalletActions.loadWalletData, state => ({ ...state, loading: true })),
  on(WalletActions.loadWalletDataSuccess, (state, { balance, transactions }) => ({
    ...state,
    balance,
    transactions,
    loading: false
  })),
  on(WalletActions.updateBalanceAfterMutation, (state, { newBalance, newTransaction }) => ({
    ...state,
    balance: newBalance,
    transactions: [newTransaction, ...state.transactions]
  }))
);
