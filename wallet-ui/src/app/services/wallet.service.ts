import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql } from 'apollo-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as WalletActions from '../state/wallet.actions';

// Ajustado para o schema exato do backend (getWallet) que retorna apenas o balance
const GET_WALLET_DASHBOARD = gql`
  query GetWalletDashboard($walletId: ID!) {
    getWallet(id: $walletId) {
      balance
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  // Ajustado para o endpoint real do backend (sem /v1)
  private restUrl = 'http://localhost:8080/api/transactions';

  constructor(
    private http: HttpClient,
    private apollo: Apollo,
    private store: Store
  ) {}

  fetchDashboardData(walletId: string): void {
    this.store.dispatch(WalletActions.loadWalletData());

    this.apollo.watchQuery<any>({
      query: GET_WALLET_DASHBOARD,
      variables: { walletId },
      fetchPolicy: 'no-cache' // Força a buscar sempre do backend/redis
    }).valueChanges.subscribe({
      next: (result) => {
        const wallet = result.data?.getWallet; // Ajustado de wallet para getWallet
        if (wallet) {
          this.store.dispatch(WalletActions.loadWalletDataSuccess({
            balance: wallet.balance,
            transactions: [] // O backend atual não envia o histórico na query GraphQL
          }));
        }
      },
      error: (err) => console.error('Erro carregando GraphQL:', err)
    });
  }

  transfer(payload: { sourceWalletId: string; destinationWalletId: string; amount: number }): Observable<any> {
    return this.http.post(`${this.restUrl}/transfer`, payload).pipe(
      tap(() => {
        // Como o backend retorna Void, disparamos um recarregamento para atualizar a tela
        this.fetchDashboardData(payload.sourceWalletId);
      })
    );
  }

  deposit(payload: { walletId: string; amount: number }): Observable<any> {
    return this.http.post(`${this.restUrl}/deposit`, payload).pipe(
      tap(() => {
        // Disparamos um recarregamento do painel completo
        this.fetchDashboardData(payload.walletId);
      })
    );
  }
}
