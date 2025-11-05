import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-alerts-intensity-chart',
  standalone: true,
  template: `
  <div class="relative w-full h-40">
    <svg class="w-full h-full block" preserveAspectRatio="none" [attr.viewBox]="'0 0 ' + vw + ' ' + vh">
      <rect [attr.width]="vw" [attr.height]="vh" fill="#374151" rx="10" />
      <g stroke="#4b5563" stroke-width="1" opacity="0.35">
        @for (y of gridY; track y) { <line x1="0" [attr.y1]="y" [attr.x2]="vw" [attr.y2]="y"></line> }
      </g>
      <path [attr.d]="areaPath()" fill="url(#gradArea)" opacity="0.55"></path>
      <path [attr.d]="linePath()" fill="none" stroke="#38bdf8" stroke-width="2"></path>
      <g fill="#38bdf8" opacity="0.9">
        @for (p of points(); track p.x) { <circle [attr.cx]="p.x" [attr.cy]="p.y" r="2.2"></circle> }
      </g>
      <defs>
        <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
    </svg>
    <div class="absolute top-2 right-3 text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">●</div>
  </div>
  `,
})
export class AlertsIntensityChart implements OnInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private zone: NgZone) {}

  vw = 600; vh = 160;
  gridY = [this.vh*0.2, this.vh*0.4, this.vh*0.6, this.vh*0.8];

  private _values = signal<number[]>(this.seed(48));
  private pad = 6;
  private timer?: ReturnType<typeof setInterval>;
  private isBrowser = false;
  private tickCount = 0;

  private min = computed(() => Math.min(...this._values()));
  private max = computed(() => Math.max(...this._values()));

  points = computed(() => {
    const data = this._values(); const n = data.length;
    const min = this.min(), max = this.max(); const range = Math.max(1, max - min);
    const dx = this.vw / Math.max(1, n - 1);
    return data.map((v, i) => {
      const x = i * dx;
      const t = (v - min) / range;
      const y = this.vh - this.pad - t * (this.vh - this.pad*2);
      return { x, y };
    });
  });

  linePath = computed(() => {
    const pts = this.points(); if (!pts.length) return '';
    return 'M ' + pts.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ');
  });

  areaPath = computed(() => {
    const pts = this.points(); if (!pts.length) return '';
    const top = 'M ' + pts.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ');
    return `${top} L ${this.vw} ${this.vh - this.pad} L 0 ${this.vh - this.pad} Z`;
  });

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.zone.run(() => this.pushRandom());
      }, 1000);
    });
  }

  ngOnDestroy() { if (this.timer) clearInterval(this.timer); }

  private seed(n: number) {
    const arr: number[] = [];
    let v = 60 + Math.random()*20;
    for (let i = 0; i < n; i++) {
      v += (Math.random() - 0.5) * 8;
      v += Math.sin((i/12)*Math.PI) * 2;
      v = Math.max(20, Math.min(100, v));
      arr.push(Number(v.toFixed(1)));
    }
    return arr;
  }

  private pushRandom() {
    const data = this._values().slice();
    const last = data[data.length - 1] ?? 60;
    let v = last + (Math.random() - 0.5) * 10 + (Math.random() - 0.5) * 2;
    v = Math.max(20, Math.min(100, v));
    data.push(Number(v.toFixed(1)));
    if (data.length > 60) data.shift();
    this._values.set(data);

    // “reseed” ocasional para mantener dinamismo (sin effect())
    this.tickCount++;
    if (this.tickCount % 30 === 0) {
      const range = this.max() - this.min();
      if (range < 5) this._values.set(this.seed(48));
    }
  }
}
