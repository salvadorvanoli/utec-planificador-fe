import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { NgOptimizedImage } from "@angular/common";

@Component({
  selector: 'app-navbar',
  imports: [
    RouterModule,
    MenubarModule,
    ButtonModule,
    NgOptimizedImage
],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navbar {
  items = input.required<MenuItem[]>();
}
