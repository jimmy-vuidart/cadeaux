import { APP_INITIALIZER, EnvironmentProviders, Injectable, InjectionToken, Provider, effect, inject, signal } from '@angular/core';

export type UxThemeMode = 'light' | 'dark' | 'auto';
export type UxDensity = 'comfortable' | 'compact';

export interface UxConfig {
  theme: UxThemeMode;
  density: UxDensity;
  motion: 'auto' | 'reduce' | 'prefer';
  radiusScale: 1 | 0.875 | 0.75 | 1.125; // scales CSS radius tokens
  brand?: {
    50?: string; 100?: string; 200?: string; 300?: string; 400?: string;
    500?: string; 600?: string; 700?: string; 800?: string; 900?: string;
  };
}

export const DEFAULT_UX_CONFIG: UxConfig = {
  theme: 'auto',
  density: 'comfortable',
  motion: 'auto',
  radiusScale: 1,
};

export const UX_CONFIG = new InjectionToken<UxConfig>('UX_CONFIG', {
  factory: () => DEFAULT_UX_CONFIG,
});

@Injectable({ providedIn: 'root' })
export class UxService {
  private readonly cfg = signal<UxConfig>(inject(UX_CONFIG));

  init(): void {
    const docEl = document.documentElement;
    // Theme
    const theme = this.resolveTheme(this.cfg().theme);
    docEl.classList.toggle('theme-dark', theme === 'dark');

    // Density
    docEl.dataset['density'] = this.cfg().density;

    // Motion
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionMode = this.cfg().motion === 'auto' ? (prefersReduce ? 'reduce' : 'prefer') : this.cfg().motion;
    docEl.dataset['motion'] = motionMode;

    // Radius scaling via root variables
    const scale = this.cfg().radiusScale;
    const style = docEl.style;
    const get = (name: string) => getComputedStyle(docEl).getPropertyValue(name).trim();
    const toPx = (v: string) => parseFloat(v.replace('rem', ''));
    const setScaled = (name: string, base: string) => {
      const n = (toPx(base) * Number(scale)).toFixed(4) + 'rem';
      style.setProperty(name, n);
    };
    setScaled('--radius-sm', get('--radius-sm'));
    setScaled('--radius-md', get('--radius-md'));
    setScaled('--radius-lg', get('--radius-lg'));

    // Optional brand overrides
    const brand = this.cfg().brand;
    if (brand) {
      for (const [k, v] of Object.entries(brand)) {
        if (v) docEl.style.setProperty(`--brand-${k}`, v);
      }
    }
  }

  update(partial: Partial<UxConfig>): void {
    this.cfg.update((prev) => ({ ...prev, ...partial }));
    this.init();
  }

  private resolveTheme(mode: UxThemeMode): 'light' | 'dark' {
    if (mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  }
}

export function provideUx(config?: Partial<UxConfig>): EnvironmentProviders | Provider[] {
  const merged: UxConfig = { ...DEFAULT_UX_CONFIG, ...(config ?? {}) };
  return [
    { provide: UX_CONFIG, useValue: merged },
    // Ensure UxService initializes at app start
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (svc: UxService) => () => {
        svc.init();
      },
      deps: [UxService],
    },
  ];
}
