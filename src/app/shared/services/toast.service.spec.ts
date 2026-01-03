import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show a toast', () => {
    const initialLength = service.currentToasts().length;
    service.show('Test message');
    expect(service.currentToasts().length).toBe(initialLength + 1);
  });



  it('should dismiss a toast', () => {
    service.show('Test message');
    const toast = service.currentToasts()[0];
    service.dismiss(toast.id);
    expect(service.currentToasts().length).toBe(0);
  });

  it('should dismiss all toasts', () => {
    service.show('Test message 1');
    service.show('Test message 2');
    expect(service.currentToasts().length).toBe(2);
    
    service.dismissAll();
    expect(service.currentToasts().length).toBe(0);
  });

  it('should show success toast', () => {
    service.success('Success message');
    const toast = service.currentToasts()[0];
    expect(toast.type).toBe('success');
  });

  it('should show error toast', () => {
    service.error('Error message');
    const toast = service.currentToasts()[0];
    expect(toast.type).toBe('error');
  });

  it('should show info toast', () => {
    service.info('Info message');
    const toast = service.currentToasts()[0];
    expect(toast.type).toBe('info');
  });

  it('should show warning toast', () => {
    service.warning('Warning message');
    const toast = service.currentToasts()[0];
    expect(toast.type).toBe('warning');
  });
});