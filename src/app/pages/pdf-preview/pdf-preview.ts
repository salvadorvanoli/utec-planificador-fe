import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentPdfComponent } from '@app/features/planner/components/student-pdf/student-pdf';
import { extractContextFromUrl } from '@app/shared/utils/context-encoder';

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
    // Extract courseId from encrypted queryParams
    this.route.queryParams.subscribe(params => {
      const context = extractContextFromUrl(params);
      const courseId = context?.courseId;
      
      if (courseId) {
        this.courseId.set(courseId);
      } else {
        console.warn('[PdfPreview] No courseId found in encrypted context');
      }
    });
  }
}
