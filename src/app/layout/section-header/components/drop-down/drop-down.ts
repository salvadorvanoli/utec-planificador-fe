import { ChangeDetectionStrategy, Component, computed, input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Router } from '@angular/router'; 

type Color = 'blue' | 'black';

interface MenuOption {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.html',
  styleUrls: ['./drop-down.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectModule, FormsModule],
  host: {
    '[style.--dropdown-bg-color]': 'color() === "blue" ? "#00A9E0" : "#000000"',
    '[style.--dropdown-border-color]': 'color() === "blue" ? "#00A9E0" : "#000000"',
    '[style.--dropdown-overlay-bg]': 'color() === "blue" ? "#000000" : "#00A9E0"',
    '[style.--dropdown-hover-color]': 'color() === "blue" ? "#333333" : "#0088b8"'
  }
})
export class DropDown {
  readonly color = input<Color>('blue');
  private readonly router = inject(Router); 

  private readonly _options = signal<MenuOption[]>([
    { 
      id: 'home', 
      name: 'Home', 
      icon: 'pi pi-home'
    },
    {
      id: 'chart',
      name: 'Chart',
      icon: 'pi pi-chart-bar'
    },
    {
      id: 'users',
      name: 'Users',
      icon: 'pi pi-users'
    },
    {
      id: 'comments',
      name: 'Comments',
      icon: 'pi pi-comments'
    }
  ]);

  options = this._options;
  selectedId = signal('home');
  isDropdownOpen = signal(false);
  
  dropdownIcon = computed(() => 
    this.isDropdownOpen() ? 'pi pi-caret-down' : 'pi pi-caret-left'
  );

  updateSelection(id: string) {
    if (this.selectedId() === id) {
      this.selectedId.set('');
      setTimeout(() => this.selectedId.set(id), 0);
    }
    if (id === 'chart') {
      this.router.navigate(['/statistics-page']);
    } else if (id === 'home') {
      this.router.navigate(['/option-page'], { queryParams: { mainMenu: true } });
    } else if (id === 'comments') {
      this.router.navigate(['/chat-page']);
    } else if (id === 'users') {
      this.router.navigate(['/course-catalog'], { queryParams: { alumno: true } });
    }
  }

  setDropdownState(isOpen: boolean) {
    this.isDropdownOpen.set(isOpen);
  }
}