import { Component, signal, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ColorOption {
  name: string;
  hex: string;
}

@Component({
  selector: 'app-color-picker',
  imports: [CommonModule],
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.scss'
})
export class ColorPicker {
  // Input para el color seleccionado por defecto
  selectedColor = input<string>('#E53935');
  
  // Output para emitir cuando cambie el color
  onColorChange = output<string>();
  
  // Color options
  colorOptions: ColorOption[] = [
    { name: 'Rojo intenso', hex: '#E53935' },
    { name: 'Azul eléctrico', hex: '#2979FF' },
    { name: 'Verde lima', hex: '#76FF03' },
    { name: 'Fucsia', hex: '#D81B60' },
    { name: 'Naranja vibrante', hex: '#FF9100' },
    { name: 'Amarillo brillante', hex: '#FFEB3B' },
    { name: 'Turquesa fuerte', hex: '#00B8D4' },
    { name: 'Violeta intenso', hex: '#8E24AA' }
  ];

  selectColor(hex: string): void {
    this.onColorChange.emit(hex);
    console.log('[ColorPicker] Color selected:', hex);
  }
}
