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
  imports: [FormsModule, MultiSelectModule],
  templateUrl: './multiselect.html',
  styleUrl: './multiselect.scss',
  standalone: true,
  host: {
    '[style.--multiselect-dropdown-bg]': 'color() === "blue" ? "#00A9E0" : "#000000"'
  }
})
export class Multiselect implements OnInit {
    readonly color = input<Color>('blue');
    readonly placeholder = input<string>('Seleccionar');
    
    // Input para recibir opciones del backend
    readonly options = input<EnumOption[]>([]);
    
    // Input para recibir los valores seleccionados
    readonly selectedValues = input<string[]>([]);
    
    // Output para emitir cambios en la selección
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
        
        // Effect para actualizar los items seleccionados cuando cambien selectedValues
        effect(() => {
            const values = this.selectedValues();
            const currentItems = this.items();
            
            if (values && values.length > 0 && currentItems.length > 0) {
                const selected = currentItems.filter(item => 
                    values.includes(item.code)
                );
                this.selectedItems.set(selected);
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
