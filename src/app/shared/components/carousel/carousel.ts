import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { NgOptimizedImage } from '@angular/common';

export type Noticia = {
    title: string;
    subtitle: string;
    image: string; 
  };

@Component({
  selector: 'app-carousel',
  imports: [CarouselModule, NgOptimizedImage],
  templateUrl: './carousel.html',
  styleUrl: './carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Carousel {

  readonly noticias = signal<Noticia[]>([
    {
      title: '"Es un símbolo de que se puede": estudiantes de UTEC se titularon en Ciencia de Datos en MIT',
      subtitle: 'Recibir un título en el Instituto Tecnológico de Massachusetts (MIT) de Boston no se da todos los días. Situaciones inimaginables hace algunos años, gratitud, la sensación de esta...',
      image: 'assets/images/newsTest/Noticia1.jpg'
    },
    {
      title: '"Una universidad abierta al mundo: UTEC recibió docentes de China y Estados Unidos que compartieron su idioma y cultura',
      subtitle: 'Estas experiencias se desarrollaron en el marco de las acciones de internacionalización impulsadas por el programa de Lenguas del Centro Global.',
      image: 'assets/images/newsTest/Noticia2.jpg'
    },
  ]);

}
