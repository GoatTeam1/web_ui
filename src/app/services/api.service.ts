import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'  // Se puede inyectar en cualquier parte de la aplicación para acceder a la API y servicios relacionados
})
export class ApiService {
    private baseUrl = 'http://localhost:3000/api';
    constructor(private http: HttpClient) { }

    //* === SIN TOKEN ===

    // Petición sin token
    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/auth/sign-in`, { email, password });
    }
}