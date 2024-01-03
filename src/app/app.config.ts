import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideState, provideStore} from '@ngrx/store';
import {provideEffects} from '@ngrx/effects';
import {provideRouterStore} from '@ngrx/router-store';
import {chessReducer} from "./game/state/reducer";
import { provideAnimations } from '@angular/platform-browser/animations';
import {ChessEffects} from "./game/state/effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideStore(),
    provideState({ name: 'chess', reducer: chessReducer }),
    provideEffects(ChessEffects),
    provideRouterStore(),
    provideAnimations()
]
};
