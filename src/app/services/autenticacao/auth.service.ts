import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'authToken';

  constructor() { }


  saveTokenLocalStorage(token: any): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }


  getTokenLocalStorage(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }


  removeToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getTokenLocalStorage();
  }
}