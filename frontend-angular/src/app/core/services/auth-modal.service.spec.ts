import { AuthModalService } from './auth-modal.service';

describe('AuthModalService', () => {
  let service: AuthModalService;

  beforeEach(() => {
    service = new AuthModalService();
  });

  it('starts closed with the signin view', () => {
    expect(service.isOpen()).toBe(false);
    expect(service.view()).toBe('signin');
  });

  it('openModal() opens the modal defaulting to signin', () => {
    service.openModal();
    expect(service.isOpen()).toBe(true);
    expect(service.view()).toBe('signin');
  });

  it('openModal(view) opens the modal on the requested view', () => {
    service.openModal('signup');
    expect(service.isOpen()).toBe(true);
    expect(service.view()).toBe('signup');
  });

  it('closeModal() closes the modal without changing the view', () => {
    service.openModal('forgot');
    service.closeModal();
    expect(service.isOpen()).toBe(false);
    expect(service.view()).toBe('forgot');
  });

  it('setView() changes the view without affecting isOpen', () => {
    service.setView('verify');
    expect(service.view()).toBe('verify');
    expect(service.isOpen()).toBe(false);
  });
});
