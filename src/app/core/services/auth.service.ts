import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { LoginRequest, AuthTokens, AuthUser, ChangePasswordRequest, UserRole } from '../models/auth.models';

const ACCESS_TOKEN_KEY  = 'mp_access_token';
const REFRESH_TOKEN_KEY = 'mp_refresh_token';
const USER_KEY          = 'mp_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;

  private _user = signal<AuthUser | null>(this.loadUser());
  readonly user    = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly role    = computed(() => this._user()?.role ?? null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginRequest) {
    return this.http.post<ApiResponse<{ user: AuthUser } & AuthTokens>>(`${this.api}/login`, body).pipe(
      tap(res => {
        const { accessToken, refreshToken, user } = res.data;
        this.storeTokens(accessToken, refreshToken);
        this.setUser(user);
      }),
    );
  }

  refreshTokens() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));
    return this.http.post<ApiResponse<AuthTokens>>(`${this.api}/refresh`, { refreshToken }).pipe(
      tap(res => this.storeTokens(res.data.accessToken, res.data.refreshToken)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      }),
    );
  }

  getMe() {
    return this.http.get<ApiResponse<AuthUser>>(`${this.api}/me`).pipe(
      tap(res => this.setUser(res.data)),
    );
  }

  changePassword(body: ChangePasswordRequest) {
    return this.http.put<ApiResponse<void>>(`${this.api}/change-password`, body);
  }

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken()  { return localStorage.getItem(ACCESS_TOKEN_KEY); }
  getRefreshToken() { return localStorage.getItem(REFRESH_TOKEN_KEY); }

  hasRole(...roles: UserRole[]) {
    const r = this._user()?.role;
    return r ? roles.includes(r) : false;
  }

  private storeTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  }

  private setUser(user: AuthUser) {
    this._user.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}
