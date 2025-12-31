import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);
  
  // Récupérer les toasts actuels
  readonly currentToasts = this.toasts.asReadonly();
  
  // Afficher un toast
  show(message: string, type: ToastType = 'info', duration: number = 3000): void {
    const id = Date.now().toString();
    
    this.toasts.update(current => [...current, { id, message, type, duration }]);
    
    // Supprimer automatiquement le toast après la durée spécifiée
    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }
  
  // Supprimer un toast spécifique
  dismiss(id: string): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }
  
  // Supprimer tous les toasts
  dismissAll(): void {
    this.toasts.set([]);
  }
  
  // Méthodes pratiques pour différents types de toasts
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }
  
  error(message: string, duration: number = 3000): void {
    this.show(message, 'error', duration);
  }
  
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }
  
  warning(message: string, duration: number = 3000): void {
    this.show(message, 'warning', duration);
  }
}