import { Component } from '@angular/core';
import { Carousel } from '@app/shared/components/carousel/carousel';
import { Header } from '@app/layout/header/header';
import { Footer } from '@app/layout/footer/footer';
import { TitleAndBackground } from './components/title-and-background/title-and-background';
import { Titulo } from '@app/shared/components/titulo/titulo';
@Component({
  selector: 'app-home',
  imports: [Carousel, Header, Footer, TitleAndBackground, Titulo],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
