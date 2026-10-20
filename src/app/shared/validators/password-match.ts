import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validateur de groupe de formulaire vérifiant que les champs `password` et `confirmPassword` sont identiques.
 * Renvoie l'erreur `passwordMismatch` sur le groupe en cas de différence.
 */
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}
