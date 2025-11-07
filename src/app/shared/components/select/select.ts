import { Component, OnInit, input, output, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';

interface Item {
    name: string;
    code: string;
}

export interface EnumOption {
    value: string;
    displayValue: string;
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
    readonly placeholder = input<string>('Seleccionar');
    
    readonly options = input<EnumOption[]>([]);
    
    readonly selectedValue = input<string>('');
    
    readonly onSelectionChange = output<string>();
    
    items = signal<Item[]>([]);
    selectedItem = signal<Item | undefined>(undefined);

    constructor() {
        // Effect para convertir las opciones del backend al formato interno
        effect(() => {
            const backendOptions = this.options();
            
            if (backendOptions && backendOptions.length > 0) {
                // Si hay opciones del backend, convertirlas al formato Item
                const convertedItems = backendOptions.map(opt => ({
                    name: opt.displayValue,
                    code: opt.value
                }));
                this.items.set(convertedItems);
            } else {
                // Si no hay opciones, usar items por defecto
                this.items.set([
                    { name: 'Item 1', code: 'NY' },
                    { name: 'Item 2', code: 'RM' },
                    { name: 'Item 3', code: 'LDN' },
                    { name: 'Item 4', code: 'IST' },
                    { name: 'Item 5', code: 'PRS' }
                ]);
            }
        });
        
        // Effect para actualizar el item seleccionado cuando cambie selectedValue
        effect(() => {
            const value = this.selectedValue();
            const currentItems = this.items();
            
            if (value && currentItems.length > 0) {
                const item = currentItems.find(i => i.code === value);
                if (item) {
                    this.selectedItem.set(item);
                }
            }
        });
    }

    ngOnInit() {
        // Ya no es necesario inicializar items aquí, se hace en el effect
    }

    onItemChange(item: Item | undefined): void {
        this.selectedItem.set(item);
        if (item) {
            this.onSelectionChange.emit(item.code);
        }
    }
}