import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { App } from './app';
import { reducers } from './store/app.state';
import { metaReducers } from './store/persist.meta-reducer';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideStore(reducers, { metaReducers })],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('toggles the dark class on the document root based on the theme store', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
