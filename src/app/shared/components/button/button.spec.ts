import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should have default values', () => {
      expect(component.color()).toBe('blue');
      expect(component.label()).toBe('Button');
      expect(component.fontFamily()).toBe('inherit');
      expect(component.fontWeight()).toBe('400');
      expect(component.fontSize()).toBe('1rem');
      expect(component.textColor()).toBe('#FFFFFF');
    });

    it('should accept color input', () => {
      fixture.componentRef.setInput('color', 'red');
      fixture.detectChanges();
      expect(component.color()).toBe('red');
    });

    it('should accept label input', () => {
      const testLabel = 'Test Button';
      fixture.componentRef.setInput('label', testLabel);
      fixture.detectChanges();
      expect(component.label()).toBe(testLabel);
    });

    it('should accept custom font properties', () => {
      fixture.componentRef.setInput('fontFamily', 'Arial');
      fixture.componentRef.setInput('fontWeight', '700');
      fixture.componentRef.setInput('fontSize', '1.5rem');
      fixture.detectChanges();

      expect(component.fontFamily()).toBe('Arial');
      expect(component.fontWeight()).toBe('700');
      expect(component.fontSize()).toBe('1.5rem');
    });
  });

  describe('Computed properties', () => {
    it('should compute correct background color for blue', () => {
      fixture.componentRef.setInput('color', 'blue');
      expect(component.buttonBgColor()).toBe('#00A9E0');
      expect(component.buttonBgHoverColor()).toBe('#0090b8');
    });

    it('should compute correct background color for red', () => {
      fixture.componentRef.setInput('color', 'red');
      expect(component.buttonBgColor()).toBe('#E61610');
      expect(component.buttonBgHoverColor()).toBe('#c50e0a');
    });

    it('should compute correct background color for white', () => {
      fixture.componentRef.setInput('color', 'white');
      expect(component.buttonBgColor()).toBe('#FFFFFF');
      expect(component.buttonBgHoverColor()).toBe('#f3f4f6');
    });

    it('should compute correct background color for black', () => {
      fixture.componentRef.setInput('color', 'black');
      expect(component.buttonBgColor()).toBe('#000000');
      expect(component.buttonBgHoverColor()).toBe('#333333');
    });
  });

  describe('Event handling', () => {
    it('should emit onClick event when button is clicked', () => {
      let emittedEvent: MouseEvent | undefined;
      component.onClick.subscribe((event: MouseEvent) => {
        emittedEvent = event;
      });

      const button = debugElement.query(By.css('p-button'));
      expect(button).toBeTruthy();

      button.triggerEventHandler('onClick', new MouseEvent('click'));

      expect(emittedEvent).toBeDefined();
    });
  });

  describe('DOM rendering', () => {
    it('should render p-button with correct label', () => {
      const testLabel = 'Click Me';
      fixture.componentRef.setInput('label', testLabel);
      fixture.detectChanges();

      const pButton = debugElement.query(By.css('p-button'));
      expect(pButton).toBeTruthy();

      const buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe(testLabel);
    });

    it('should apply host bindings for custom styles', () => {
      fixture.componentRef.setInput('color', 'red');
      fixture.componentRef.setInput('fontFamily', 'Roboto');
      fixture.detectChanges();

      const hostElement = debugElement.nativeElement;

      // Verificar que las variables CSS estén definidas
      expect(hostElement.style.getPropertyValue('--button-bg')).toBe('#E61610');
      expect(hostElement.style.getPropertyValue('--button-font-family')).toBe('Roboto');
    });
  });

  describe('Change detection', () => {
    it('should update computed values when color changes', () => {
      fixture.componentRef.setInput('color', 'blue');
      expect(component.buttonBgColor()).toBe('#00A9E0');

      fixture.componentRef.setInput('color', 'red');
      expect(component.buttonBgColor()).toBe('#E61610');
    });
  });
});

