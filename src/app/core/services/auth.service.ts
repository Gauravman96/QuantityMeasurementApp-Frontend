import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { APP_PATHS } from '../config/app-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = APP_PATHS.authApi;

  //  Inject PLATFORM_ID to check browser vs server
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(data: { username: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, data);
  }

  register(data: { username: string; password: string }) {
    return this.http.post<string>(`${this.baseUrl}/register`, data, {
      responseType: 'text' as 'json'
    });
  }

  saveToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null; //  on server, return null safely
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
