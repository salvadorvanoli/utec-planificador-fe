import { ChangeDetectionStrategy, Component, inject, input, computed } from '@angular/core';
import { ButtonComponent } from '@app/shared/components/button/button';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-header',
  imports: [ButtonComponent],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--header-bg]': 'headerBg()',
    '[style.--header-underline]': 'headerUnderline()',
    // cuando isHome true, quitar del flujo usando position fixed y top:0
    '[style.position]': 'headerPosition()',
    '[style.top]': 'headerTop()',
    '[style.left]': 'headerLeft()',
    '[style.width]': 'headerWidth()',
    '[style.zIndex]': 'headerZ()',
    '[style.marginBottom]': 'headerMarginBottom()'
  }
})
export class Header {
  readonly isHome = input<boolean>(false);
  private readonly router = inject(Router); 

  readonly headerBg = computed(() => (this.isHome() ? 'transparent' : 'rgb(52, 58, 64)'));

  readonly headerPosition = computed(() => (this.isHome() ? 'absolute' : 'relative'));
  readonly headerTop = computed(() => (this.isHome() ? '0px' : 'auto'));
  readonly headerLeft = computed(() => (this.isHome() ? '0px' : 'auto'));
  readonly headerWidth = computed(() => (this.isHome() ? '100%' : 'auto'));
  readonly headerZ = computed(() => (this.isHome() ? '30' : '20'));
  readonly headerMarginBottom = computed(() => (this.isHome() ? '0px' : '2rem'));
  
  readonly headerUnderline = computed(() => (this.isHome() ? '#00A9E0' : 'transparent'));
  
  goToHome(): void {
    this.router.navigate(['/home']);
  }

  goToOptionMenu(): void {
    this.router.navigate(['/option-page'], { queryParams: { mainMenu: true } });
  }

}