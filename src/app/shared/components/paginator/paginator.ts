import { Component, input, output } from '@angular/core';
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

    handlePageChange(event: PaginatorState): void {
        this.onPageChange.emit(event);
    }
}
