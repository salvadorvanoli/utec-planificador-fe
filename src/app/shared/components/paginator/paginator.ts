import { Component } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.html',
    styleUrl: './paginator.scss',
    standalone: true,
    imports: [PaginatorModule]
})
export class Paginator {
    first: number = 0;

    rows: number = 10;

    onPageChange(event: PaginatorState) {
        this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
    }
}