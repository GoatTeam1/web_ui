import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-attack-map',
  standalone: true,
  template: `
  <div class="relative w-full h-[360px] md:h-[440px] rounded-md overflow-hidden">
    @if (loaded()) {
      <div id="geoMap" class="w-full h-full"></div>
    } @else {
      <div class="w-full h-full flex items-center justify-center bg-gray-800 text-sm text-gray-300">
        Loading world map…
      </div>
    }
  </div>
  `
})
export class AttackMapComponent implements AfterViewInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  loaded = signal(true);
  private isBrowser = false;
  private interval?: any;
  private chart!: any;
  private data!: any;

  // mantén una ventana de últimos X segundos
  private ttlMs = 5000;
  private attacks: {lat:number; lon:number; sev:number; label:string; ts:number}[] = [];

  private seeds = [
    { city: 'New York',      lat: 40.71, lon: -74.00 },
    { city: 'London',        lat: 51.50, lon:  -0.12 },
    { city: 'Mexico City',   lat: 19.43, lon: -99.13 },
    { city: 'São Paulo',     lat: -23.55, lon: -46.63 },
    { city: 'Tokyo',         lat: 35.68, lon: 139.69 },
    { city: 'Seoul',         lat: 37.56, lon: 126.97 },
    { city: 'Sydney',        lat: -33.86, lon: 151.21 },
    { city: 'Johannesburg',  lat: -26.20, lon:  28.04 },
    { city: 'Madrid',        lat: 40.42, lon:  -3.70 },
    { city: 'Toronto',       lat: 43.65, lon: -79.38 },
    { city: 'Moscow',        lat: 55.75, lon:  37.61 },
    { city: 'Singapore',     lat:  1.35, lon: 103.82 },
  ];

  async ngAfterViewInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    await this.loadGoogleCharts();
    google.charts.load('current', {
      packages: ['geochart'],
      // Usa tu key (o quítala si ya no es necesaria en tu entorno)
      mapsApiKey: 'TU_API_KEY'
    });

    google.charts.setOnLoadCallback(() => this.initChart());
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }

  private async loadGoogleCharts() {
    if ((window as any).google?.charts) return;
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://www.gstatic.com/charts/loader.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  private initChart() {
    // DataTable: Lat, Lon, Label, Severity (num para colorAxis/sizeAxis)
    this.data = new google.visualization.DataTable();
    this.data.addColumn('number', 'Latitude');
    this.data.addColumn('number', 'Longitude');
    this.data.addColumn('number', 'Severity');

    this.chart = new google.visualization.GeoChart(document.getElementById('geoMap'));

    this.loaded.set(true);
    this.redraw();

    // Simulación periódica
    this.interval = setInterval(() => {
      // agrega 1–3 ataques
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i=0; i<n; i++) this.pushRandomAttack();
      // purga por TTL
      const now = Date.now();
      this.attacks = this.attacks.filter(a => (now - a.ts) < this.ttlMs);
      this.redraw();
    }, 1000);

    // responsivo
    window.addEventListener('resize', this.redraw, { passive: true });
  }

  private redraw = () => {
    if (!this.chart) return;

    // reconstruye filas
    this.data.removeRows(0, this.data.getNumberOfRows());
    if (this.attacks.length) {
      const rows = this.attacks.map(a => [a.lat, a.lon, a.sev]);
      this.data.addRows(rows);
    }

    const options = {
      region: 'world',
      displayMode: 'markers',
      backgroundColor: 'transparent',
      datalessRegionColor: '#6687cb',
      defaultColor: '#38bdf8',
      legend: 'none',
      keepAspectRatio: true,
      colorAxis: { values: [1, 2, 3], colors: ['#22c55e', '#f59e0b', '#ef4444'] }
    };

    this.chart.draw(this.data, options);
  };

  private pushRandomAttack() {
    const useSeed = Math.random() < 0.7;
    let lat: number, lon: number, label: string;
    if (useSeed) {
      const s = this.seeds[Math.floor(Math.random() * this.seeds.length)];
      lat = s.lat + (Math.random() - 0.5) * 2.2;
      lon = s.lon + (Math.random() - 0.5) * 2.2;
      label = s.city;
    } else {
      lat = -90 + Math.random() * 180;
      lon = -180 + Math.random() * 360;
      label = lat.toFixed(1)+','+lon.toFixed(1);
    }
    const r = Math.random();
    const sev = r < 0.65 ? 1 : (r < 0.9 ? 2 : 3); // 1=low,2=med,3=high
    this.attacks.push({ lat, lon, sev, label: `${label} (sev ${sev})`, ts: Date.now() });
    if (this.attacks.length > 150) this.attacks.shift();
  }
}