import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideStore } from '@ngrx/store';
import { walletReducer } from './core/state/wallet.reducer';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';

export function createApollo(httpLink: HttpLink): ApolloClientOptions {
  return {
    link: httpLink.create({ uri: 'http://localhost:8080/graphql' }),
    cache: new InMemoryCache(),
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ wallet: walletReducer }),
    provideHttpClient(withInterceptors([authInterceptor])),
    
    Apollo,
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
};
