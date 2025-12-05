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

  meses = [
    { value: 1, nombre: 'Enero' },
    { value: 2, nombre: 'Febrero' },
    { value: 3, nombre: 'Marzo' },
    { value: 4, nombre: 'Abril' },
    { value: 5, nombre: 'Mayo' },
    { value: 6, nombre: 'Junio' },
    { value: 7, nombre: 'Julio' },
    { value: 8, nombre: 'Agosto' },
    { value: 9, nombre: 'Septiembre' },
    { value: 10, nombre: 'Octubre' },
    { value: 11, nombre: 'Noviembre' },
    { value: 12, nombre: 'Diciembre' }
  ];
  mes = 1;
  year = new Date().getFullYear();
  loadingReport = false;
  errorMessage = '';
  hasOfflineReport = false;

  ips: any[] = [];
  loadingIPs = false;
  errorIPs = '';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.cargarIPs();
    this.verificarReportesOffline();
  }

  verificarReportesOffline() {
    const lastReport = localStorage.getItem('lastReport');
    this.hasOfflineReport = lastReport !== null;
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

        // Descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'reporte.pdf';
        a.click();
        window.URL.revokeObjectURL(url);

        // Guardar en localStorage para uso offline
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const reportKey = `report_${this.mes}_${this.year}`;
          try {
            localStorage.setItem(reportKey, base64data);
            localStorage.setItem('lastReport', reportKey);
            console.log('PDF guardado en localStorage:', reportKey);
          } catch (e) {
            console.warn('No se pudo guardar en localStorage (probablemente por límite de espacio):', e);
          }
        };
        reader.readAsDataURL(blob);
        this.verificarReportesOffline();
      },
      error: err => {
        this.loadingReport = false;
        this.errorMessage = err?.error?.message || 'Error al descargar el reporte. Intenta nuevamente.';
        console.error('Error al descargar el reporte', err);
      }
    });
  }

  verReporteOffline() {
    const lastReportKey = localStorage.getItem('lastReport');
    if (lastReportKey) {
      const base64 = localStorage.getItem(lastReportKey);
      if (base64) {
        const link = document.createElement('a');
        link.href = base64;
        link.download = `${lastReportKey}.pdf`;
        link.click();
        console.log('Abriendo reporte offline:', lastReportKey);
      } else {
        console.error('No se encontró el reporte en localStorage');
      }
    } else {
      console.error('No hay reportes guardados');
    }
  }
}
