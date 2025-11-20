import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentPdfComponent } from '@app/features/planner/components/student-pdf/student-pdf';

@Component({
  selector: 'app-pdf-preview',
  imports: [StudentPdfComponent],
  templateUrl: './pdf-preview.html',
  styleUrls: ['./pdf-preview.scss']
})
export class PdfPreview implements OnInit {
  private readonly route = inject(ActivatedRoute);
  
  courseId = signal<number>(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('courseId');
    if (id) {
      this.courseId.set(+id);
    }
  }
}
