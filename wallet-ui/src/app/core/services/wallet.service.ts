import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Apollo, gql } from 'apollo-angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as WalletActions from '../state/wallet.actions';

const GET_WALLET_DASHBOARD = gql`
  query GetWalletDashboard($walletId: ID!) {
    getWallet(id: $walletId) {
      balance
      transactions {
        id
        type
        amount
        timestamp
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class WalletService {
  private restUrl = 'http://localhost:8080/api/transactions';

  constructor(private http: HttpClient, private apollo: Apollo, private store: Store) {}

  fetchDashboardData(walletId: string): void {
    this.store.dispatch(WalletActions.loadWalletData());
    this.apollo.watchQuery<any>({
      query: GET_WALLET_DASHBOARD,
      variables: { walletId },
      fetchPolicy: 'no-cache'
    }).valueChanges.subscribe({
      next: (result) => {
        const wallet = result.data?.getWallet;
        if (wallet) {
          this.store.dispatch(WalletActions.loadWalletDataSuccess({
            balance: wallet.balance,
            transactions: wallet.transactions || [] // Agora o GraphQL traz o extrato!
          }));
        }
      },
      error: (err) => console.error('Erro GraphQL:', err)
    });
  }

  // ALterado destinationWalletId para pixKey
  transfer(payload: { sourceWalletId: string; pixKey: string; amount: number }): Observable<any> {
    return this.http.post(`${this.restUrl}/transfer`, payload).pipe(
      tap(() => this.fetchDashboardData(payload.sourceWalletId))
    );
  }

  deposit(payload: { walletId: string; amount: number }): Observable<any> {
    return this.http.post(`${this.restUrl}/deposit`, payload).pipe(
      tap(() => this.fetchDashboardData(payload.walletId))
    );
  }
}