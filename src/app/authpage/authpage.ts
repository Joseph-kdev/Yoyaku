import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../authservice';

export interface UserModel {
  email: string;
  password: string
}

@Component({
  selector: 'app-authpage',
  imports: [FormsModule],
  templateUrl: './authpage.html',
  styleUrl: './authpage.css',
})
export class Authpage {
  isSignUp = signal(false);
  authService = inject(Authservice)
  router = inject(Router)

  constructor() {
    this.authService.user$.subscribe(user => {
      if(user) {
        this.router.navigate([''], { replaceUrl: true })
      }
    })
  }

  toggleMode() {
    this.isSignUp.update(value => !value);
  }

  readonly user: UserModel = {
    email: '',
    password: ''
  }

  async addUser(form: any) {
    if(form.invalid) return
    if(this.isSignUp()) {
      try {
        await this.authService.register(this.user.email, this.user.password)
        return
      } catch (error) {
        console.log("Failed to register user", error)
        return
      }
    }
    try {
      await this.authService.login(this.user.email, this.user.password)
      return
    } catch (error) {
      console.log("Failed to login user", error)
      return
    }
  }

  async signInWithGoogle() {
    try {
      await this.authService.loginWithGoogle()
      return
    } catch (error) {
      console.log("Failed Google auth", error)
    }
  }
}
