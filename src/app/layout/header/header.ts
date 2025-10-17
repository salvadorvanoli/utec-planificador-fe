import { Component, signal } from '@angular/core';

import { Navbar } from '@layout/header/components/navbar/navbar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  imports: [
    Navbar,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true
})
export class Header {
  menuItems = signal<MenuItem[]>([
    {
      label: 'Planificación',
      icon: 'pi pi-calendar',
      routerLink: '/planning'
    },
    {
      label: 'Tareas',
      icon: 'pi pi-list',
      routerLink: '/tasks'
    }
  ]);
}
