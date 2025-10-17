import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';

interface AutoCompleteCompleteEvent {
    originalEvent: Event;
    query: string;
}

@Component({
    selector: 'app-searchbar',
    templateUrl: './searchbar.html',
    styleUrl: './searchbar.scss',
    imports: [AutoComplete, FormsModule],
    standalone: true,
})
export class Searchbar {
    items: any[] = [];

    value: any;

    search(event: AutoCompleteCompleteEvent) {
        this.items = [...Array(10).keys()].map(item => event.query + '-' + item);
    }
}