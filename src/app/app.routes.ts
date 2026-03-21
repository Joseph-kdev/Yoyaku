import { Routes } from '@angular/router';
import { Authpage } from './authpage/authpage';
import { CalendarView } from './calendar-view/calendar-view';

export const routes: Routes = [
  {
    path: '',
    component: CalendarView
  },
  {
    path: 'login',
    component: Authpage
  }
];
