import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/core/services';
import { LoginRequest } from '@app/core/models';
import { Header } from '@app/layout/header/header';
import { Footer } from '@app/layout/footer/footer';
import { InfoButton } from '@app/layout/section-header/components/info-button/info-button';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Header, Footer, InfoButton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly loginForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(100)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(128)
    ])
  });

  togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials: LoginRequest = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/option-page']);
      },
      error: (error: { status: number; error?: { message?: string } }) => {
        this.isLoading.set(false);

        // Usar el mensaje del backend si está disponible
        const errorMsg = error.error?.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
        this.errorMessage.set(errorMsg);
      }
    });
  }

  getEmailError(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required') && emailControl?.touched) {
      return 'El correo es requerido';
    }
    if (emailControl?.hasError('maxlength') && emailControl?.touched) {
      return 'El correo no puede exceder 100 caracteres';
    }
    if (emailControl?.hasError('email') && emailControl?.touched) {
      return 'Ingresa un correo válido';
    }
    return '';
  }

  getPasswordError(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required') && passwordControl?.touched) {
      return 'La contraseña es requerida';
    }
    if (passwordControl?.hasError('minlength') && passwordControl?.touched) {
      return 'La contraseña es requerida';
    }
    return '';
  }
}

