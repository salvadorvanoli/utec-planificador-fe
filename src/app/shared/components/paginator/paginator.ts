import { Component, input, output, effect } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.html',
    styleUrl: './paginator.scss',
    standalone: true,
    imports: [PaginatorModule]
})
export class Paginator {
    // Inputs from parent
    totalRecords = input<number>(0);
    rows = input<number>(10);
    first = input<number>(0);

    // Output event for page changes
    onPageChange = output<PaginatorState>();

    constructor() {
        // Efecto para detectar cambios en totalRecords y resetear a la primera página
        effect(() => {
            const total = this.totalRecords();
            const currentFirst = this.first();
            const rowsPerPage = this.rows();
            
            // Si estamos en una página que ya no existe después del cambio, resetear
            if (currentFirst > 0 && currentFirst >= total) {
                console.log('[Paginator] Total records changed, resetting to first page');
                this.onPageChange.emit({
                    first: 0,
                    rows: rowsPerPage,
                    page: 0,
                    pageCount: Math.ceil(total / rowsPerPage)
                });
            }
        });
    }

    handlePageChange(event: PaginatorState): void {
        this.onPageChange.emit(event);
    }
}
