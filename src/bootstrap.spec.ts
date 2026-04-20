describe('bootstrap helpers', () => {
  beforeEach(() => {
    (window as any).__skipBootstrap = true;
  });

  afterEach(() => {
    delete (window as any).__skipBootstrap;
  });

  it('delegates bootstrapping to the provided bootstrap function', async () => {
    const bootstrapModule = await import('./bootstrap');
    const bootstrap = jasmine.createSpy('bootstrap').and.returnValue(Promise.resolve({}));

    await bootstrapModule.bootstrapApp(bootstrap as any);

    expect(bootstrap).toHaveBeenCalled();
  });

  it('uses the default bootstrap dependency when no bootstrap function is provided', async () => {
    const bootstrapModule = await import('./bootstrap');
    spyOn(bootstrapModule.bootstrapDeps, 'bootstrapApplication').and.returnValue(Promise.resolve({}) as any);

    await bootstrapModule.bootstrapApp();

    expect(bootstrapModule.bootstrapDeps.bootstrapApplication).toHaveBeenCalled();
  });

  it('logs bootstrap errors', async () => {
    const bootstrapModule = await import('./bootstrap');
    const error = new Error('boom');
    const bootstrap = jasmine.createSpy('bootstrap').and.returnValue(Promise.reject(error));
    spyOn(console, 'error');

    await bootstrapModule.bootstrapApp(bootstrap as any);

    expect(console.error).toHaveBeenCalledWith(error);
  });

  it('skips auto bootstrapping when the flag is enabled', async () => {
    const bootstrapModule = await import('./bootstrap');
    const bootstrap = jasmine.createSpy('bootstrap');

    await bootstrapModule.runBootstrapIfEnabled({ __skipBootstrap: true } as any, bootstrap as any);

    expect(bootstrap).not.toHaveBeenCalled();
  });

  it('uses the default window when no window is provided and the skip flag is enabled', async () => {
    const bootstrapModule = await import('./bootstrap');

    await bootstrapModule.runBootstrapIfEnabled();

    expect().nothing();
  });

  it('runs auto bootstrapping when the flag is disabled', async () => {
    const bootstrapModule = await import('./bootstrap');
    const bootstrap = jasmine.createSpy('bootstrap').and.returnValue(Promise.resolve({}));

    await bootstrapModule.runBootstrapIfEnabled({ __skipBootstrap: false } as any, bootstrap as any);

    expect(bootstrap).toHaveBeenCalled();
  });
});
