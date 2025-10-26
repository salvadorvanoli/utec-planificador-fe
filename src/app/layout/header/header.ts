import { Component, signal } from '@angular/core';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [ ],
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
