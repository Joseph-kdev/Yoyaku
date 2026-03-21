import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Auth, user } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';
import { Authservice } from '../authservice';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly title = signal('Yoyaku');
  private auth = inject(Auth);
  user$ = user(this.auth);
  authService = inject(Authservice)

  async signOutOfApp() {
    try {
      await this.authService.logout()
    } catch (error) {
      console.log("Error logging out", error)
    }
  }
}
