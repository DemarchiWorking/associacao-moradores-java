import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

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

    public isLoggedIn(): boolean {
    const token = this.getTokenLocalStorage();

    if (!token) {
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      
      // O campo 'exp' (expiration) do JWT é um timestamp (em segundos).
      // Compara a data de expiração com a data/hora atual.
      const isTokenExpired = decodedToken.exp < Date.now() / 1000;
      
      // Retorna true se o token não estiver expirado.
      return !isTokenExpired;

    } catch (error) {
      // Se houver um erro na decodificação, o token é inválido.
      console.error('Erro ao decodificar o token:', error);
      return false;
    }
  }
}