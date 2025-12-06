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
  
  // Input para determinar si es para actividad o contenido
  activity = input<boolean>(true);
  
  // Input para deshabilitar el selector
  disabled = input<boolean>(false);
  
  // Input para modo readonly (solo lectura con apariencia normal)
  readonly = input<boolean>(false);
  
  // Output para emitir cuando cambie el color
  onColorChange = output<string>();
  
  // Colores para actividades (intensos)
  activityColors: ColorOption[] = [
    { name: 'Rojo intenso', hex: '#E53935' },
    { name: 'Azul eléctrico', hex: '#2979FF' },
    { name: 'Verde lima', hex: '#76FF03' },
    { name: 'Fucsia', hex: '#D81B60' },
    { name: 'Naranja vibrante', hex: '#FF9100' },
    { name: 'Amarillo brillante', hex: '#FFEB3B' },
    { name: 'Turquesa fuerte', hex: '#00B8D4' },
    { name: 'Violeta intenso', hex: '#8E24AA' }
  ];
  
  // Colores para contenidos (pasteles)
  contentColors: ColorOption[] = [
    { name: 'Rosa suave', hex: '#F8BBD0' },
    { name: 'Celeste pastel', hex: '#B3E5FC' },
    { name: 'Verde menta', hex: '#C8E6C9' },
    { name: 'Durazno claro', hex: '#FFDAB9' },
    { name: 'Amarillo crema', hex: '#FFF9C4' },
    { name: 'Lavanda suave', hex: '#E1BEE7' },
    { name: 'Turquesa claro', hex: '#B2EBF2' },
    { name: 'Lila pastel', hex: '#D1C4E9' }
  ];
  
  // Computed para obtener los colores según el tipo
  get colorOptions(): ColorOption[] {
    return this.activity() ? this.activityColors : this.contentColors;
  }

  selectColor(hex: string): void {
    this.onColorChange.emit(hex);
    console.log('[ColorPicker] Color selected:', hex);
  }
}
