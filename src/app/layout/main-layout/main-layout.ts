import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { Header } from '@layout/header/header';
import { Footer } from '@layout/footer/footer';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    Header,
    Footer,
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout {

}
