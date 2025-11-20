import { Component, OnInit, input, output, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

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
    selector: 'app-multiselect',
    templateUrl: './multiselect.html',
    styleUrl: './multiselect.scss',
    standalone: true,
    imports: [FormsModule, MultiSelectModule],
    host: {
        '[style.--multiselect-dropdown-bg]': 'color() === "blue" ? "#00A9E0" : "#000000"'
    }
})
export class MultiSelector implements OnInit {
    readonly color = input<Color>('blue');
    readonly placeholder = input<string>('Seleccionar');
    readonly showClear = input<boolean>(true);
    readonly filter = input<boolean>(true);
    readonly filterPlaceholder = input<string>('Buscar');
    
    readonly options = input<EnumOption[]>([]);
    
    readonly selectedValues = input<string[]>([]);
    
    readonly onSelectionChange = output<string[]>();
    
    items = signal<Item[]>([]);
    selectedItems = signal<Item[]>([]);

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
                // Si no hay opciones, establecer array vacío
                this.items.set([]);
            }
        });
        
        // Effect para actualizar los items seleccionados cuando cambien selectedValues
        effect(() => {
            const values = this.selectedValues();
            const currentItems = this.items();
            
            if (values && values.length > 0 && currentItems.length > 0) {
                const items = currentItems.filter(i => values.includes(i.code));
                this.selectedItems.set(items);
            } else {
                this.selectedItems.set([]);
            }
        });
    }

    ngOnInit() {
        // Ya no es necesario inicializar items aquí, se hace en el effect
    }

    onItemsChange(items: Item[]): void {
        this.selectedItems.set(items);
        
        if (items && items.length > 0) {
            const codes = items.map(item => item.code);
            this.onSelectionChange.emit(codes);
        } else {
            this.onSelectionChange.emit([]);
        }
    }
}
