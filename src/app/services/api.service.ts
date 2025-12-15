import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    private baseUrl = 'https://actual-clementia-goat-team2-5c68b199.koyeb.app/api';

    constructor(private http: HttpClient) { }

    //* === sin token ===

    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/auth/sign-in`, { email, password });
    }

    //* === Headers con token ===

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        if (!token) return new HttpHeaders();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    //* === REPORTES (PDF con blob) ===

    getReport(mes: number, año: number): Observable<{ blob: Blob, filename?: string }> {
        const headers = this.getAuthHeaders();
        const params = { mes: String(mes), año: String(año) };

        return this.http.get(`${this.baseUrl}/report`, {
            headers,
            params,
            observe: 'response',
            responseType: 'blob'
        }).pipe(
            map((res: HttpResponse<Blob>) => {
                const cd = res.headers.get('content-disposition') || '';
                const filename = this.extractFilename(cd) || `reporte-${mes}-${año}.pdf`;
                return { blob: res.body as Blob, filename };
            }),
            catchError(err => throwError(() => err))
        );
    }

    getIPs(): Observable<any> {
        const headers = this.getAuthHeaders();
        return this.http.get(`${this.baseUrl}/ip-info`, { headers });
    }


    private extractFilename(header: string): string | null {
        const match = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(header);
        return match ? decodeURIComponent(match[1]) : null;
    }
}
