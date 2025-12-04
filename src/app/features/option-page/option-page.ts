import { ChangeDetectionStrategy, Component, signal, inject, OnInit, computed } from '@angular/core';
import { SectionHeader } from '../../layout/section-header/section-header';
import { InfoType } from '@app/core/enums/info';
import { OptionPanel } from '@app/features/option-page/components/option-panel/option-panel';
import { ActivatedRoute, Router } from '@angular/router';
import { PositionService } from '@app/core/services';
import { extractContextFromUrl } from '@app/shared/utils/context-encoder';
import { Role } from '@app/core/enums/role';

type SelectionStep = 'itr' | 'campus' | 'main-menu';

@Component({
  selector: 'app-option-page',
  imports: [SectionHeader, OptionPanel],
  templateUrl: './option-page.html',
  styleUrl: './option-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionPage implements OnInit {
  readonly InfoType = InfoType;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly positionService = inject(PositionService);
  readonly step = signal<SelectionStep>('itr');

  // Computed: generates dynamic description based on current step
  readonly dynamicDescription = computed(() => {
    const currentStep = this.step();

    if (currentStep === 'itr') {
      return 'Seleccione el Instituto Tecnológico Regional (ITR) al cual desea acceder. Puede elegir entre los ITRs donde tiene posiciones activas asignadas.';
    }

    if (currentStep === 'campus') {
      return 'Seleccione la sede del ITR a la cual desea acceder. Cada sede puede tener diferentes cursos y configuraciones disponibles según sus roles asignados.';
    }

    if (currentStep === 'main-menu') {
      const roles = this.positionService.availableRoles();
      const options: string[] = [];

      if (roles.includes(Role.TEACHER)) {
        options.push('<strong>Planificador:</strong> Acceda a los cursos donde es docente para crear y gestionar sus planificaciones semanales, incluyendo contenidos, actividades y evaluación.');
        options.push('<strong>Panel Estadístico:</strong> Visualice estadísticas detalladas de sus cursos, incluyendo distribución de horas y balance de modalidades.');
        options.push('<strong>EduBot:</strong> Utilice el asistente de inteligencia artificial para obtener recomendaciones pedagógicas y sugerencias para sus planificaciones.');
      }

      if (roles.includes(Role.COORDINATOR) || roles.includes(Role.ANALYST)) {
        options.push('<strong>Asignar Cursos:</strong> Gestione la asignación de docentes a los diferentes cursos de la sede seleccionada.');
      }

      if (roles.includes(Role.COORDINATOR) || roles.includes(Role.EDUCATION_MANAGER)) {
        options.push('<strong>Información de Cursos:</strong> Consulte y descargue información completa de todos los cursos de la sede, incluyendo sus planificaciones en formato PDF.');
      }

      if (options.length > 0) {
        return 'Seleccione la acción que desea realizar. Las opciones disponibles están basadas en sus roles:<br><br>' + options.join('<br><br>');
      }

      return 'Seleccione la acción que desea realizar según las opciones disponibles para sus roles asignados.';
    }

    return null;
  });

  ngOnInit(): void {
    // Intentar procesar parámetros si las posiciones ya están cargadas
    const processUrlParams = () => {
      this.route.queryParams.subscribe(query => {
        try {
          const contextParams = extractContextFromUrl(query);

          // Si el token está presente pero es inválido, redirigir a inicio
          if (query['ctx'] && !contextParams) {
            console.warn('[OptionPage] Invalid context token, redirecting to ITR selection');
            this.router.navigate(['/option-page']);
            this.step.set('itr');
            return;
          }

          // Si hay contexto completo (itrId y campusId), construirlo
          if (contextParams?.itrId && contextParams?.campusId && contextParams.campusId !== -1) {
          if (this.positionService.validateContext(contextParams.itrId, contextParams.campusId)) {
            const context = this.positionService.buildContextFromUrlParams(contextParams.itrId, contextParams.campusId);
            if (context) {
              this.positionService.selectedContext.set(context);
              this.positionService.availableRoles.set(context.roles);
              this.step.set('main-menu');
              return;
            }
          }
          // Si los parámetros son inválidos, redirigir a selección de ITR
          this.router.navigate(['/option-page']);
          return;
        }

        // Si solo hay itrId, ir a selección de campus
        if (contextParams?.itrId && !contextParams?.campusId) {
          const positions = this.positionService.userPositions();
          const itr = positions?.positions.find(
            position => position.isActive && position.regionalTechnologicalInstitute.id === contextParams.itrId
          )?.regionalTechnologicalInstitute;

          if (itr) {
            // selectITR ya setea availableCampuses y selectedContext
            this.positionService.selectITR(itr);
            this.step.set('campus');
            return;
          }
          // Si el itrId es inválido, redirigir a selección de ITR
          this.router.navigate(['/option-page']);
          return;
        }

        // Si hay step parameter en el contexto pero sin IDs, usar el step
        const stepParam = contextParams?.step;
        if (stepParam === 'campus') {
          this.step.set('campus');
        } else if (stepParam === 'main-menu') {
          this.step.set('main-menu');
        } else {
          // Por defecto, ir a selección de ITR
          this.step.set('itr');
        }
        } catch (error) {
          // Error procesando parámetros, ir a selección de ITR
          console.error('[OptionPage] Error processing URL params:', error);
          this.step.set('itr');
        }
      });
    };

    // Si las posiciones ya están cargadas, procesar inmediatamente
    if (this.positionService.userPositions()) {
      processUrlParams();
    } else {
      // Si no, cargarlas primero
      this.positionService.getUserPositions().subscribe({
        next: () => {
          processUrlParams();
        },
        error: (error) => {
          console.error('[OptionPage] Error loading user positions:', error);
          this.router.navigate(['/home']);
        }
      });
    }
  }
}

