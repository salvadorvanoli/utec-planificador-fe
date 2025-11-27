import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Carousel } from '@app/shared/components/carousel/carousel';
import { Header } from '@app/layout/header/header';
import { Footer } from '@app/layout/footer/footer';
import { TitleAndBackground } from './components/title-and-background/title-and-background';
import { Titulo } from '@app/shared/components/titulo/titulo';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  imports: [Carousel, Header, Footer, TitleAndBackground, Titulo, Toast],
  providers: [MessageService],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    // Mostrar mensajes de error si el usuario fue redirigido por falta de permisos
    this.route.queryParams.subscribe(params => {
      const error = params['error'];
      
      if (error) {
        this.showErrorMessage(error);
        
        // Limpiar el query param después de mostrar el mensaje
        // Para evitar que se muestre nuevamente si el usuario recarga la página
        window.history.replaceState({}, '', window.location.pathname);
      }
    });
  }

  private showErrorMessage(errorCode: string): void {
    const errorMessages: Record<string, { summary: string; detail: string }> = {
      'session_expired': {
        summary: 'Sesión expirada',
        detail: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
      },
      'insufficient_permissions': {
        summary: 'Acceso denegado',
        detail: 'No tienes permisos suficientes para acceder a este recurso.'
      },
      'not_your_course': {
        summary: 'Acceso denegado',
        detail: 'No tienes permisos para acceder a este curso. Solo puedes acceder a tus propios cursos.'
      },
      'course_not_accessible': {
        summary: 'Curso no accesible',
        detail: 'El curso solicitado no existe o no tienes permisos para acceder a él.'
      }
    };

    const message = errorMessages[errorCode] || {
      summary: 'Error',
      detail: 'Ha ocurrido un error. Por favor, intenta nuevamente.'
    };

    this.messageService.add({
      severity: 'error',
      summary: message.summary,
      detail: message.detail,
      life: 6000
    });
  }
}
