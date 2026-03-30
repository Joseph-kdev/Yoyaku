import { inject, Injectable } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { EventFormData } from './event-adder/event-adder';
import { firstValueFrom, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  user$ = user(this.auth);

  async addEvent(data: EventFormData) {
    const currentUser = await firstValueFrom(this.user$);
    if (!currentUser) throw new Error('Not authenticated');

    const ref = collection(this.firestore, `users/${currentUser.uid}/entries`);

    await addDoc(ref, {
      ...data,
    });
  }

  getEvents() {
    return this.user$.pipe(
      switchMap((user) => {
        if (!user) throw new Error('Not authenticated');
        const ref = collection(this.firestore, `users/${user.uid}/entries`);
        return collectionData(ref, { idField: 'id' });
      }),
    );
  }

  async updateEvent(entryId: string, data: any) {
    const currentUser = await firstValueFrom(this.user$);
    if (!currentUser) throw new Error('Not authenticated');

    const ref = doc(this.firestore, `users/${currentUser.uid}/entries/${entryId}`);

    await updateDoc(ref, data);
  }

  async deleteEvent(entryId: string) {
    const currentUser = await firstValueFrom(this.user$);
    if (!currentUser) throw new Error('Not authenticated');

    const ref = doc(this.firestore, `users/${currentUser.uid}/entries/${entryId}`);

    await deleteDoc(ref);
  }

  async syncLocalStorageEvents() {
    const currentUser = await firstValueFrom(this.user$);
    if (!currentUser) throw new Error('Not authenticated');

    const unParsedEvents = localStorage.getItem('yoyaku_events');

    if (!unParsedEvents) {
      return;
    }

    const events: EventFormData[] = JSON.parse(unParsedEvents);
    const firebaseEvents = await firstValueFrom(this.getEvents());

    let syncedCount = 0;
    let skippedCount = 0;

    for (const e of events) {
      try {
        const isDuplicate = firebaseEvents.some(
          (fbEvent) =>
            fbEvent['title'] === e.title &&
            fbEvent['startDate'] === e.startDate &&
            fbEvent['startTime'] === e.startTime,
        );

        if(!isDuplicate) {
          await this.addEvent(e)
          syncedCount++
        } else {
          skippedCount++
        }
      } catch (error) {
        console.log('Error syncing event:', e, error)
      }
    }
  }
}
