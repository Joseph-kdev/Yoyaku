import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventAdder, EventFormData, EVENT_CATEGORIES } from '../event-adder/event-adder';
import { Navbar } from "../navbar/navbar";
import { DatabaseService } from '../database-service';
import { toSignal, toObservable } from '@angular/core/rxjs-interop'
import { catchError, Observable, of, switchMap } from 'rxjs';

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
  imports: [CommonModule, EventAdder, Navbar],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css'],
})
export class CalendarView implements OnInit {
  currentDate = new Date();
  selectedDate = signal<Date | null>(null);
  showEventModal = signal(false);
  deleteDialog = signal(false)
  editMode = signal(false)
  eventToDelete = signal<(EventFormData & { id: string }) | null>(null)
  eventToEdit = signal<(EventFormData & { id: string }) | null>(null)
  dbService = inject(DatabaseService)

  show() {
    this.showEventModal.set(true)
  }

  hide() {
    this.showEventModal.set(false)
  }

  private refreshCount = signal(0);

  private refreshEvents() {
    this.refreshCount.update(c => c + 1);
  }

  showDeleteDialog(ev: EventFormData & { id: string }) {
    this.eventToDelete.set(ev)
    this.deleteDialog.set(true)
  }

  closeDeleteDialog() {
    this.deleteDialog.set(false)
    this.eventToDelete.set(null)
  }

  async confirmDelete() {
    const event = this.eventToDelete();
    if (!event) return;

    try {
      await this.dbService.deleteEvent(event.id);
      this.closeDeleteDialog();
    } catch (error) {
      console.log('Failed to delete event:', error);
      const events = localStorage.getItem("yoyaku_events")
      if(events) {
        const parsedEvents = JSON.parse(events)
        const updated = parsedEvents.filter((e: EventFormData) =>
          e.title !== event.title
        )
        localStorage.setItem('yoyaku_events', JSON.stringify(updated))
        this.refreshEvents()
      }
    }
    this.closeDeleteDialog()
  }

  showEditDialog(ev: EventFormData & { id: string }) {
    this.eventToEdit.set(ev)
    this.editMode.set(true)
    this.show()
  }

  events = toSignal(
    toObservable(this.refreshCount).pipe(
      switchMap(() =>
        this.dbService.getEvents().pipe(
          catchError(() => {
            const stored = localStorage.getItem('yoyaku_events')
            return of(stored ? JSON.parse(stored) : [])
          })
        )
      )
    )
  )

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

  async addToEvents(newEvent: EventFormData) {
    try {
      await this.dbService.addEvent(newEvent)
      this.refreshEvents();
    } catch (error) {
      console.log("Error adding event", error);
      const current = this.events()
      const updated = [...current, newEvent]
      localStorage.setItem('yoyaku_events', JSON.stringify(updated))
      this.refreshEvents();
    }
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

    const currentEvents = this.events() || []

    return currentEvents.filter((event: EventFormData) => {
      return this.isEventActiveOnDate(event, targetDayStart);
    });
  })

  getEventsForDate(date:Date): EventFormData[] {
    const currentEvents = this.events() || []
    return currentEvents.filter((event: EventFormData) =>
      this.isEventActiveOnDate(event, date)
    )
  }

  async updateEvent(event: EventFormData & {id: string}) {
    try {
      await this.dbService.updateEvent(event.id, event)
      this.refreshEvents();
      this.editMode.set(false)
      this.eventToEdit.set(null)
      this.hide()
    } catch (error) {
      console.log("Error updating event", event);
      const current = this.events() || [];
      const updated = current.map((e: any) => {
        return e.id === event.id ? event : e;
      });
      localStorage.setItem('yoyaku_events', JSON.stringify(updated));
      this.refreshEvents();
      this.editMode.set(false)
      this.eventToEdit.set(null)
      this.hide()
    }
  }
}
