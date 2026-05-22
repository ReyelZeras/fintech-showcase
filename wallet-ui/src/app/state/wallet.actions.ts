import { createAction, props } from '@ngrx/store';

export const loadWalletData = createAction('[Wallet] Load Data');
export const loadWalletDataSuccess = createAction(
  '[Wallet] Load Data Success',
  props<{ balance: number; transactions: any[] }>()
);
export const updateBalanceAfterMutation = createAction(
  '[Wallet] Update Balance After Mutation',
  props<{ newBalance: number; newTransaction: any }>()
);
