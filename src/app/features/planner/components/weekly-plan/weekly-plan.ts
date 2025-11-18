import { Component, signal, OnInit, input, computed, effect } from '@angular/core';
import { Container } from './components/container/container';
import { WeekTitle } from './components/week-title/week-title';
import { ContentSection } from './components/content-section/content-section';
import { ActivitySection } from './components/activity-section/activity-section';
import { Bibliography } from './components/bibliography/bibliography';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { WeeklyPlanningService, WeeklyPlanningResponse, ProgrammaticContentService, ActivityService } from '@app/core/services';
import { inject } from '@angular/core';
import { ProgrammaticContent, Activity } from '@app/core/models';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-weekly-plan',
  imports: [ Container, WeekTitle, ContentSection, ActivitySection, Bibliography, ProgressSpinnerModule ],
  templateUrl: './weekly-plan.html',
  styleUrl: './weekly-plan.scss'
})
export class WeeklyPlan {
  private readonly weeklyPlanningService = inject(WeeklyPlanningService);
  private readonly programmaticContentService = inject(ProgrammaticContentService);
  private readonly activityService = inject(ActivityService);
  private readonly messageService = inject(MessageService);
  
  // Input del courseId desde el padre
  courseId = input.required<number>();
  courseStartDate = input.required<string>();
  courseEndDate = input.required<string>();
  
  // Señales de estado
  isLoading = signal(true);
  weeklyPlanning = signal<WeeklyPlanningResponse | null>(null);
  programmaticContents = signal<ProgrammaticContent[]>([]);
  selectedContent = signal<ProgrammaticContent | null>(null);
  currentWeekNumber = signal(1); // Por defecto semana 1
  weekStartDate = signal<string>('');
  weekEndDate = signal<string>('');
  
  // Computed para obtener las actividades del contenido seleccionado
  selectedActivities = computed(() => {
    return this.selectedContent()?.activities || [];
  });
  
  // Computed para las referencias bibliográficas
  bibliographicReferences = computed(() => {
    return this.weeklyPlanning()?.bibliographicReferences || [];
  });
  
  // Computed para obtener el weeklyPlanningId
  weeklyPlanningId = computed(() => {
    return this.weeklyPlanning()?.id || 0;
  });

  constructor() {
    // Effect que se ejecuta cuando courseId está disponible
    effect(() => {
      const id = this.courseId();
      if (id) {
        console.log('[WeeklyPlan] CourseId received:', id);
        this.loadWeeklyPlanning(this.currentWeekNumber());
      }
    });
  }
  
  private loadWeeklyPlanning(weekNumber: number): void {
    const id = this.courseId();
    console.log('[WeeklyPlan] Loading weekly planning for course:', id, 'week:', weekNumber);
    this.isLoading.set(true);
    
    this.weeklyPlanningService.getWeeklyPlanningByCourseAndWeekNumber(id, weekNumber).subscribe({
      next: (planning) => {
        console.log('[WeeklyPlan] Weekly planning loaded:', planning);
        this.weeklyPlanning.set(planning);
        
        // Actualizar las fechas de la semana
        this.weekStartDate.set(planning.startDate);
        this.weekEndDate.set(planning.endDate);
        console.log('[WeeklyPlan] Week dates:', { start: planning.startDate, end: planning.endDate });
        
        // Cargar los contenidos programáticos si existen IDs
        const contentIds = (planning as any).programmaticContentIds || [];
        console.log('[WeeklyPlan] Programmatic content IDs:', contentIds);
        
        if (contentIds.length > 0) {
          this.loadProgrammaticContents(contentIds);
        } else {
          this.programmaticContents.set([]);
          this.isLoading.set(false);
        }
        
        // Resetear la selección de contenido al cambiar de semana
        this.selectedContent.set(null);
      },
      error: (error) => {
        console.error('[WeeklyPlan] Error loading weekly planning:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  private loadProgrammaticContents(contentIds: number[]): void {
    console.log('[WeeklyPlan] Loading programmatic contents:', contentIds);
    
    // Crear un array de observables para cargar todos los contenidos en paralelo
    const requests = contentIds.map(id => 
      this.programmaticContentService.getProgrammaticContentById(id).pipe(
        switchMap(content => {
          // Extraer los IDs de actividades
          const activityIds = (content as any).activityIds || [];
          console.log(`[WeeklyPlan] Content ${id} has activity IDs:`, activityIds);
          
          // Si hay actividades, cargarlas
          if (activityIds.length > 0) {
            const activityRequests = activityIds.map((actId: number) => 
              this.activityService.getActivityById(actId)
            );
            
            return forkJoin(activityRequests).pipe(
              map(activities => {
                console.log(`[WeeklyPlan] Activities loaded for content ${id}:`, activities);
                // Agregar las actividades al contenido
                return { ...content, activities } as ProgrammaticContent;
              })
            );
          } else {
            // Sin actividades, devolver el contenido tal cual
            return of({ ...content, activities: [] } as ProgrammaticContent);
          }
        })
      )
    );
    
    forkJoin(requests).subscribe({
      next: (contents) => {
        console.log('[WeeklyPlan] All programmatic contents with activities loaded:', contents);
        this.programmaticContents.set(contents);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('[WeeklyPlan] Error loading programmatic contents:', error);
        this.programmaticContents.set([]);
        this.isLoading.set(false);
      }
    });
  }
  
  // Método para cambiar de semana
  changeWeek(weekNumber: number): void {
    console.log('[WeeklyPlan] Changing to week:', weekNumber);
    this.currentWeekNumber.set(weekNumber);
    this.loadWeeklyPlanning(weekNumber);
  }
  
  // Método para manejar cambio de fecha desde el picker
  handleDateRangeChange(dateRange: { startDate: string; endDate: string }): void {
    console.log('[WeeklyPlan] Date range changed from picker:', dateRange);
    const id = this.courseId();
    
    // Buscar la planificación por fecha
    this.weeklyPlanningService.getWeeklyPlanningByCourseAndDate(id, dateRange.startDate).subscribe({
      next: (planning) => {
        console.log('[WeeklyPlan] Planning found for date:', planning);
        this.currentWeekNumber.set(planning.weekNumber);
        this.weeklyPlanning.set(planning);
        this.weekStartDate.set(planning.startDate);
        this.weekEndDate.set(planning.endDate);
        
        // Cargar contenidos
        const contentIds = (planning as any).programmaticContentIds || [];
        if (contentIds.length > 0) {
          this.loadProgrammaticContents(contentIds);
        } else {
          this.programmaticContents.set([]);
        }
        
        this.selectedContent.set(null);
      },
      error: (error) => {
        console.error('[WeeklyPlan] Error loading planning by date:', error);
      }
    });
  }
  
  // Método para seleccionar un contenido y ver sus actividades
  selectContent(content: ProgrammaticContent): void {
    console.log('[WeeklyPlan] Content selected:', content);
    this.selectedContent.set(content);
  }
  
  // Método para manejar cuando se crea un nuevo contenido programático
  handleContentCreated(): void {
    console.log('[WeeklyPlan] Content created/updated, reloading programmatic contents');
    this.loadWeeklyPlanning(this.currentWeekNumber());
  }
  
  // Método para manejar la eliminación de un contenido programático
  handleContentDeleted(contentId: number): void {
    console.log('[WeeklyPlan] Delete content requested:', contentId);
    
    // Confirmar antes de eliminar
    if (confirm('¿Estás seguro de que deseas eliminar este contenido programático? Se eliminarán también todas sus actividades.')) {
      this.programmaticContentService.deleteProgrammaticContent(contentId).subscribe({
        next: () => {
          console.log('[WeeklyPlan] Content deleted successfully:', contentId);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Contenido programático eliminado correctamente'
          });
          
          // Si el contenido eliminado era el seleccionado, limpiar la selección
          if (this.selectedContent()?.id === contentId) {
            this.selectedContent.set(null);
          }
          
          // Recargar la planificación
          this.loadWeeklyPlanning(this.currentWeekNumber());
        },
        error: (error) => {
          console.error('[WeeklyPlan] Error deleting content:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el contenido programático'
          });
        }
      });
    }
  }
  
  // Método para manejar cuando se crea una nueva actividad
  handleActivityCreated(): void {
    console.log('[WeeklyPlan] Activity created, reloading current content');
    const currentContent = this.selectedContent();
    
    if (currentContent) {
      // Recargar el contenido actual para obtener las actividades actualizadas
      this.programmaticContentService.getProgrammaticContentById(currentContent.id).pipe(
        switchMap(content => {
          const activityIds = (content as any).activityIds || [];
          console.log(`[WeeklyPlan] Reloading activities for content ${currentContent.id}:`, activityIds);
          
          if (activityIds.length > 0) {
            const activityRequests = activityIds.map((actId: number) => 
              this.activityService.getActivityById(actId)
            );
            
            return forkJoin(activityRequests).pipe(
              map(activities => ({ ...content, activities } as ProgrammaticContent))
            );
          } else {
            return of({ ...content, activities: [] } as ProgrammaticContent);
          }
        })
      ).subscribe({
        next: (updatedContent) => {
          console.log('[WeeklyPlan] Content reloaded with updated activities:', updatedContent);
          
          // Actualizar el contenido en el array de programmaticContents
          const currentContents = this.programmaticContents();
          const updatedContents = currentContents.map(c => 
            c.id === updatedContent.id ? updatedContent : c
          );
          this.programmaticContents.set(updatedContents);
          
          // Actualizar el contenido seleccionado
          this.selectedContent.set(updatedContent);
        },
        error: (error) => {
          console.error('[WeeklyPlan] Error reloading content:', error);
        }
      });
    }
  }
  
  // Método para manejar la eliminación de una actividad
  handleActivityDeleted(activityId: number): void {
    console.log('[WeeklyPlan] Delete activity requested:', activityId);
    
    // Confirmar antes de eliminar
    if (confirm('¿Estás seguro de que deseas eliminar esta actividad?')) {
      this.activityService.deleteActivity(activityId).subscribe({
        next: () => {
          console.log('[WeeklyPlan] Activity deleted successfully:', activityId);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Actividad eliminada correctamente'
          });
          
          // Recargar el contenido actual
          this.handleActivityCreated();
        },
        error: (error) => {
          console.error('[WeeklyPlan] Error deleting activity:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la actividad'
          });
        }
      });
    }
  }
  
  // Método para manejar la adición de una referencia bibliográfica
  handleAddReference(reference: string): void {
    console.log('[WeeklyPlan] Add reference requested:', reference);
    const planningId = this.weeklyPlanningId();
    
    if (!planningId) {
      console.error('[WeeklyPlan] No weekly planning ID available');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo agregar la referencia'
      });
      return;
    }
    
    this.weeklyPlanningService.addBibliographicReference(planningId, reference).subscribe({
      next: (updatedPlanning) => {
        console.log('[WeeklyPlan] Reference added successfully:', updatedPlanning);
        this.weeklyPlanning.set(updatedPlanning);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Referencia bibliográfica agregada correctamente'
        });
      },
      error: (error) => {
        console.error('[WeeklyPlan] Error adding reference:', error);
        
        let errorMessage = 'No se pudo agregar la referencia bibliográfica';
        if (error.status === 400) {
          errorMessage = 'La referencia ya existe o supera los 500 caracteres';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
      }
    });
  }
  
  // Método para manejar la eliminación de una referencia bibliográfica
  handleDeleteReference(reference: string): void {
    console.log('[WeeklyPlan] Delete reference requested:', reference);
    const planningId = this.weeklyPlanningId();
    
    if (!planningId) {
      console.error('[WeeklyPlan] No weekly planning ID available');
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo eliminar la referencia'
      });
      return;
    }
    
    this.weeklyPlanningService.deleteBibliographicReference(planningId, reference).subscribe({
      next: (updatedPlanning) => {
        console.log('[WeeklyPlan] Reference deleted successfully:', updatedPlanning);
        this.weeklyPlanning.set(updatedPlanning);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Referencia bibliográfica eliminada correctamente'
        });
      },
      error: (error) => {
        console.error('[WeeklyPlan] Error deleting reference:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la referencia bibliográfica'
        });
      }
    });
  }
}
