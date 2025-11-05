import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LoginGuard {
    constructor(private router: Router) { }

    canActivate(): boolean {
        const token = localStorage.getItem('token');

        if (token) {
            // Ya hay sesión, ir al dashboard
            this.router.navigate(['/dashboard']);
            return false;
        }

        // No hay token, permitir acceso al login
        return true;
    }
}
