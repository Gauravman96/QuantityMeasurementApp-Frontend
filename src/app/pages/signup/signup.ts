import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMsg: string = '';
  successMsg: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  signup() {
    this.errorMsg = '';
    this.successMsg = '';

    // ── Validations ──
    if (!this.username || !this.password || !this.confirmPassword) {
      this.errorMsg = 'All fields are required.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 4) {
      this.errorMsg = 'Password must be at least 4 characters.';
      return;
    }

    this.loading = true;

    const data = {
      username: this.username,
      password: this.password
    };

    this.authService.register(data).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMsg = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.errorMsg = 'Username already exists. Try another.';
        } else if (err.status === 0) {
          this.errorMsg = 'Cannot reach server. Is Spring Boot running?';
        } else {
          this.errorMsg = `Error ${err.status}. Please try again.`;
        }
      }
    });
  }
}