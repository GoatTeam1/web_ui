import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  email = '';
  password = '';
  errorMessage = '';
  loading = false; // <-- faltaba

  constructor(private apiService: ApiService, private router: Router) { }

  onSubmit(event: Event) {
    console.log('Formulario enviado con:', this.email, this.password);
    event.preventDefault();
    this.errorMessage = '';
    this.loading = true;

    this.apiService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        localStorage.setItem('token', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      },
    });
  }
}
