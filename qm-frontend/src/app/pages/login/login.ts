import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';  //  add RouterLink
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { APP_PATHS } from '../../core/config/app-config';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],   //  add RouterLink here
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  login() {

    if (!this.username || !this.password) {
    alert("Please fill all fields");
    return;
  }

    const data = {
      username: this.username,
      password: this.password
    };

    console.log("Sending:", data);

    this.authService.login(data).subscribe({
      next: (res: any) => {
        console.log("Response:", res);

        //  Save JWT
        this.authService.saveToken(res.token);

        //  Navigate
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
        alert("Login failed ❌");
      }
    });
  }

  
  googleLogin() {
    window.location.href = APP_PATHS.googleAuth;
  }
}
