import { throwError } from 'rxjs';
import { AppComponent } from './app.component';
import { environment } from '../environment/environment';

describe('AppComponent', () => {
  it('warms up both backend endpoints on init and ignores errors', () => {
    const http = {
      get: jasmine.createSpy('get').and.returnValue(throwError(() => new Error('offline'))),
    };
    const component = new AppComponent(environment.API_URL, http as any);

    component.ngOnInit();

    expect(component.apiUrl).toBe(environment.API_URL);
    expect(http.get).toHaveBeenCalledWith(`${environment.API_URL}/hello`, { responseType: 'text' });
    expect(http.get).toHaveBeenCalledWith(`${environment.SOCKET_URL}/`);
  });
});
