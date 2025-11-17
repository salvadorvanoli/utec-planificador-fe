import { Component, inject, OnDestroy, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FilterStateService } from '@app/core/services';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-searchbar',
    templateUrl: './searchbar.html',
    styleUrl: './searchbar.scss',
    imports: [AutoComplete, FormsModule, IconField, InputIcon],
    standalone: true,
})
export class Searchbar implements OnDestroy {
    private readonly filterStateService = inject(FilterStateService);
    private readonly searchSubject = new Subject<string>();

    value: string = '';

    constructor() {
        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(searchText => {
            console.log('[Searchbar] Emitting search text after debounce:', searchText);
            this.filterStateService.setSearchText(searchText || undefined);
        });

        effect(() => {
            const searchText = this.filterStateService.searchText();
            if (searchText === undefined && this.value !== '') {
                console.log('[Searchbar] Search text cleared externally, resetting local value');
                this.value = '';
            }
        });
    }

    onSearchChange(event: any): void {
        const searchText = event.target?.value || event || '';
        console.log('[Searchbar] Search input changed:', searchText);
        this.searchSubject.next(searchText);
    }

    ngOnDestroy(): void {
        this.searchSubject.complete();
    }
}