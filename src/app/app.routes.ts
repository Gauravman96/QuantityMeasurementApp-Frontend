import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { HistoryComponent } from './pages/history/history';

export const routes: Routes = [

  //  default route
  { path: '', component: Login },

  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'dashboard', component: DashboardComponent  },
  { path: 'history', component: HistoryComponent },


  // fallback(invalid Url handle)
  { path: '**', redirectTo: '' }
];