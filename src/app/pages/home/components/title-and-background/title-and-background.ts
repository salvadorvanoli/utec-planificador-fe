import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-title-and-background',
  imports: [NgOptimizedImage],
  templateUrl: './title-and-background.html',
  styleUrls: ['./title-and-background.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleAndBackground {
  // ruta relativa a assets (NgOptimizedImage)
  readonly bg = 'assets/images/backgrounds/HomeBackground.jpg';
}
