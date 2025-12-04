import { Component } from '@angular/core';
import { AttackMapComponent } from '../../components/attack-map/attack-map';
import { AlertsIntensityChart } from '../../components/alerts-intensity-chart/alerts-intensity-chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AttackMapComponent, AlertsIntensityChart],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/sign-in';
  }
}

