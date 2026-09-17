import { createActionGroup, emptyProps, props } from '@ngrx/store';

export type Theme = 'light' | 'dark';

export const ThemeActions = createActionGroup({
  source: 'Theme',
  events: {
    'Toggle Theme': emptyProps(),
    'Set Theme': props<{ theme: Theme }>(),
    'Hydrate': props<{ theme: Theme }>(),
  },
});
