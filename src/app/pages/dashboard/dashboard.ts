import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttackMapComponent } from '../../components/attack-map/attack-map';
import { AlertsIntensityChart } from '../../components/alerts-intensity-chart/alerts-intensity-chart';
import { ApiService } from '../../services/api.service'; // importa tu servicio
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AttackMapComponent, AlertsIntensityChart, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
}) export class Dashboard {

  meses = [ /* tu array igual */];
  mes = 1;
  year = new Date().getFullYear();
  loadingReport = false;
  errorMessage = '';

  ips: any[] = [];
  loadingIPs = false;
  errorIPs = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.cargarIPs();
  }

  cargarIPs() {
    this.loadingIPs = true;
    this.errorIPs = '';

    this.api.getIPs().subscribe({
      next: (data) => {
        this.ips = data;
        this.loadingIPs = false;
      },
      error: () => {
        this.errorIPs = 'Error al obtener IPs';
        this.loadingIPs = false;
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/sign-in';
  }

  downloadReport() {
    this.loadingReport = true;
    this.errorMessage = '';

    this.api.getReport(this.mes, this.year).subscribe({
      next: ({ blob, filename }) => {
        this.loadingReport = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'reporte.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        this.loadingReport = false;
        this.errorMessage = err?.error?.message || 'Error al descargar el reporte. Intenta nuevamente.';
        console.error('Error al descargar el reporte', err);
      }
    });
  }
}
