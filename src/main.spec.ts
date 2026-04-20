describe('main entrypoint', () => {
  beforeEach(() => {
    (window as any).__skipBootstrap = true;
  });

  afterEach(() => {
    delete (window as any).__skipBootstrap;
  });

  it('delegates to the provided runner', async () => {
    const mainModule = await import('./main');
    const run = jasmine.createSpy('run').and.returnValue(Promise.resolve());

    await mainModule.startMain(run as any, { __skipBootstrap: true } as any);

    expect(run).toHaveBeenCalledWith({ __skipBootstrap: true });
  });
});
