import { Component, OnInit, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

interface Item {
    name: string;
    code: string;
}

type Color = 'blue' | 'black';

@Component({
    selector: 'app-select',
    templateUrl: './select.html',
    styleUrl: './select.scss',
    standalone: true,
    imports: [FormsModule, Select],
    host: {
    '[style.--select-dropdown-bg]': 'color() === "blue" ? "#00A9E0" : "#000000"'
  }
})
export class Selector implements OnInit {
    readonly color = input<Color>('blue');
    items: Item[] | undefined;
    readonly placeholder = input<string>('Seleccionar');
    selectedItem: Item | undefined;

    ngOnInit() {
        this.items = [
            { name: 'Item 1', code: 'NY' },
            { name: 'Item 2', code: 'RM' },
            { name: 'Item 3', code: 'LDN' },
            { name: 'Item 4', code: 'IST' },
            { name: 'Item 5', code: 'PRS' }
        ];
    }
}