import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GameEnvService } from './game-env.service';
import { GameEnv } from '../models/game-env';
import { environment } from '../../environment/environment';

describe('GameEnvService', () => {
  let service: GameEnvService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameEnvService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(GameEnvService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads all user game environments', () => {
    let result: GameEnv[] | undefined;

    service.findAll().subscribe((value) => {
      result = value;
    });

    const request = httpMock.expectOne(`${environment.API_URL}/gameEnv`);
    expect(request.request.method).toBe('GET');
    request.flush([new GameEnv('1', 'Beach')]);

    expect(result?.[0].name).toBe('Beach');
  });

  it('loads all default game environments', () => {
    service.findAllDefault().subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/gameEnv/default`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('loads a game environment by id', () => {
    service.findById('env-1').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/gameEnv/env-1`);
    expect(request.request.method).toBe('GET');
    request.flush(new GameEnv('env-1', 'Airport'));
  });

  it('deletes a game environment', () => {
    service.delete('env-1').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/gameEnv/env-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('creates a game environment', () => {
    service.create('Museum').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/gameEnv`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Museum' });
    request.flush(new GameEnv('env-2', 'Museum'));
  });

  it('updates a game environment', () => {
    service.update(new GameEnv('env-3', 'School')).subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/gameEnv/env-3`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ name: 'School' });
    request.flush(new GameEnv('env-3', 'School'));
  });
});
