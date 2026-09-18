import { vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('success() pushes a toast of type success', () => {
    service.success('Boutique créée !');
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0]).toMatchObject({ type: 'success', text: 'Boutique créée !' });
  });

  it('error() pushes a toast of type error', () => {
    service.error('Une erreur est survenue');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('info() pushes a toast of type info', () => {
    service.info('Info');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('assigns increasing ids to successive toasts', () => {
    service.success('one');
    service.success('two');
    expect(service.toasts()[1].id).toBeGreaterThan(service.toasts()[0].id);
  });

  it('dismiss() removes only the matching toast', () => {
    service.success('one');
    service.success('two');
    const [first, second] = service.toasts();

    service.dismiss(first.id);

    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].id).toBe(second.id);
  });

  it('auto-dismisses a toast after 4 seconds', () => {
    service.success('one');
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(4000);

    expect(service.toasts()).toHaveLength(0);
  });
});
