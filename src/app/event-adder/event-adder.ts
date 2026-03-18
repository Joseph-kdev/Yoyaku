import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, input, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type EventCategory = 'meeting' | 'appointment' | 'task' | 'reminder' | 'social' | 'other';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type ReminderTime = '5min' | '15min' | '30min' | '1hour' | '1day' | '1week';

export const EVENT_CATEGORIES: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'meeting', label: 'Meeting', icon: '👥' },
  { value: 'appointment', label: 'Appointment', icon: '📅' },
  { value: 'task', label: 'Task', icon: '✅' },
  { value: 'reminder', label: 'Reminder', icon: '🔔' },
  { value: 'social', label: 'Social', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '📌' },
];

export interface EventFormData {
  title: string;
  description: string;
  category: EventCategory | '';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  priority: PriorityLevel | '';
  wantsReminder: boolean;
  reminderTime: ReminderTime | '';
}

@Component({
  selector: 'app-event-adder',
  imports: [FormsModule, CommonModule],
  templateUrl: './event-adder.html',
  styleUrl: './event-adder.css',
})
export class EventAdder implements OnInit {
  showEventModal = input.required<boolean>()
  selectedDate = input<Date | null>(null);
  closeModal = output<void>();
  addEvent = output<EventFormData>();



  submitted = false;
  submitSuccess = false;

  form: EventFormData = {
    title: '',
    description: '',
    category: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    priority: '',
    wantsReminder: false,
    reminderTime: '',
  };

  ngOnInit() {
    const selDate = this.selectedDate();
    if (selDate) {
      const year = selDate.getFullYear();
      const month = (selDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selDate.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      this.form.startDate = dateStr;
      this.form.endDate = dateStr;
    }
  }

  categories = EVENT_CATEGORIES;

  priorities: { value: PriorityLevel; label: string; color: string; bg: string }[] = [
    {
      value: 'low',
      label: 'Low',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
    },
    {
      value: 'medium',
      label: 'Medium',
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    },
    {
      value: 'high',
      label: 'High',
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200 hover:bg-rose-100',
    },
  ];

  reminderOptions: { value: ReminderTime; label: string }[] = [
    { value: '5min', label: '5 minutes before' },
    { value: '15min', label: '15 minutes before' },
    { value: '30min', label: '30 minutes before' },
    { value: '1hour', label: '1 hour before' },
    { value: '1day', label: '1 day before' },
    { value: '1week', label: '1 week before' },
  ];

  selectCategory(val: EventCategory): void {
    this.form.category = val;
  }

  selectPriority(val: PriorityLevel): void {
    this.form.priority = val;
  }

  toggleReminder(): void {
    this.form.wantsReminder = !this.form.wantsReminder;
    if (!this.form.wantsReminder) {
      this.form.reminderTime = '';
    }
  }

  isValid(): boolean {
    return !!(
      this.form.title.trim() &&
      this.form.category &&
      this.form.startDate &&
      this.form.startTime &&
      this.form.endDate &&
      this.form.endTime &&
      this.form.priority &&
      (!this.form.wantsReminder || this.form.reminderTime)
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.isValid()) return;
    this.addEvent.emit(this.form)
    this.submitSuccess = true;
    setTimeout(() => {
      this.submitSuccess = false;
      this.closeModal.emit();
    }, 3000);
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onReset(): void {
    this.submitted = false;
    this.submitSuccess = false;
    this.form = {
      title: '',
      description: '',
      category: '',
      startDate: this.form.startDate, // Keep pre-filled date
      startTime: '',
      endDate: this.form.endDate, // Keep pre-filled date
      endTime: '',
      location: '',
      priority: '',
      wantsReminder: false,
      reminderTime: '',
    };
    this.closeModal.emit();
  }
}
