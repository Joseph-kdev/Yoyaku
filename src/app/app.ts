import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalendarView } from './calendar-view/calendar-view';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CalendarView],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true
})
export class App {
  protected readonly title = signal('Yoyaku');
}
