import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [NgOptimizedImage],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Footer {
 
  readonly logo = 'assets/images/logos/LOGO_HEADER.svg';

 
  readonly socialLinks = {
    facebook: 'https://www.facebook.com/utecuy',
    twitter: 'https://x.com/UTECuy',
    instagram: 'https://www.instagram.com/utecuy/#',
    youtube: 'https://www.youtube.com/channel/UC6p0TCY8JtOVzuH_TjSy4VQ'
  };

  openSocialLink(platform: keyof typeof this.socialLinks): void {
    window.open(this.socialLinks[platform], '_blank', 'noopener,noreferrer');
  }
}
