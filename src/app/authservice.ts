import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  private auth = inject(Auth)

  user$ = user(this.auth)

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password))
  }

  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password))
  }

  logout() {
    return from (signOut(this.auth))
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    return from(signInWithPopup(this.auth, provider))
  }
}
