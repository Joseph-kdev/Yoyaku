import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { CalendarView } from './calendar-view/calendar-view';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true
})
export class App implements OnInit {
  showWarning = signal(false);

  ngOnInit(): void {
    const isSmallScreen = window.innerWidth <= 767;
    const dismissed = sessionStorage.getItem('smallScreenWarningDismissed') === 'true';

    if (isSmallScreen && !dismissed) {
      this.showWarning.set(true);
    }
  }

  dismissWarning(): void {
    this.showWarning.set(false);
    sessionStorage.setItem('smallScreenWarningDismissed', 'true');
  }

}
