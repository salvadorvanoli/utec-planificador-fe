import { Component, OnInit, input, output, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { IftaLabelModule } from 'primeng/iftalabel';

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
    imports: [FormsModule, Select, IftaLabelModule],
    host: {
    '[style.--select-dropdown-bg]': 'color() === "blue" ? "#00A9E0" : "#000000"'
  }
})
export class Selector implements OnInit {
    readonly color = input<Color>('blue');
    readonly placeholder = input<string>('Seleccionar');
    readonly label = input<string>(''); // Label opcional
    
    readonly options = input<EnumOption[]>([]);
    
    readonly selectedValue = input<string>('');
    
    readonly appendTo = input<string | HTMLElement | undefined>(undefined);
    
    readonly disabled = input<boolean>(false);
    
    readonly readonly = input<boolean>(false);
    
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
                // Si no hay opciones, establecer array vacío
                this.items.set([]);
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
                } else {
                    this.selectedItem.set(undefined);
                }
            } else {
                // Si no hay valor seleccionado, limpiar la selección
                this.selectedItem.set(undefined);
            }
        });
    }

    ngOnInit() {
    }

    onItemChange(item: Item | undefined): void {
        this.selectedItem.set(item);
        if (item) {
            this.onSelectionChange.emit(item.code);
        }
    }
}