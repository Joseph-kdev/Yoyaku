import { Component, computed, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventAdder, EventFormData, EVENT_CATEGORIES } from '../event-adder/event-adder';

export interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  color: string;
}

export function getCategoryIconFn(category: string): string {
  const cat = EVENT_CATEGORIES.find(c => c.value === category);
  return cat ? cat.icon : '📌';
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, EventAdder],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css'],
})
export class CalendarView implements OnInit {
  currentDate = new Date();
  selectedDate = signal<Date | null>(null);
  showEventModal = signal(false);

  show() {
    this.showEventModal.set(true)
  }

  hide() {
    this.showEventModal.set(false)
  }

  events: WritableSignal<EventFormData[]> = signal([]);

  weeks: (Date | null)[][] = [];
  readonly weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  readonly monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  ngOnInit(): void {
    this.buildCalendar();
  }

  getCategoryIcon(category: string): string {
    return getCategoryIconFn(category);
  }

  get monthLabel(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  buildCalendar(): void {
    const year  = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [
      ...Array(first).fill(null),
      ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1)),
    ];

    // Pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    this.weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      this.weeks.push(cells.slice(i, i + 7));
    }
  }

  selectDate(date: Date | null): void {
    if (!date) return;
    this.selectedDate.set(date)
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const t = new Date();
    return date.getDate() === t.getDate() &&
           date.getMonth() === t.getMonth() &&
           date.getFullYear() === t.getFullYear();
  }

  isSelected(date: Date | null): boolean {
    if (!date) return false;
    const selected = this.selectedDate();
    if (!selected) return false;
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear();
  }

  addToEvents(newEvent: EventFormData) {
    this.events.update(currentEvents => [...currentEvents, newEvent])
  }

  isEventActiveOnDate(event: EventFormData, date:Date): boolean {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd   = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const eventStart = new Date(event.startDate);
    const eventEnd   = new Date(event.endDate);

    return eventStart <= dayEnd && eventEnd >= dayStart;
  }

  selectedEvents = computed(() => {
    const target = this.selectedDate();
    if (!target) return [];
    const targetDayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    return this.events().filter(event => {
      return this.isEventActiveOnDate(event, targetDayStart);
    });
  })

  getEventsForDate(date:Date): EventFormData[] {
    return this.events().filter(event =>
      this.isEventActiveOnDate(event, date)
    )
  }
}
