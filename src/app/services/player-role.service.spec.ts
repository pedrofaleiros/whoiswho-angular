import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlayerRoleService } from './player-role.service';
import { PlayerRole } from '../models/player-role';
import { environment } from '../../environment/environment';

describe('PlayerRoleService', () => {
  let service: PlayerRoleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlayerRoleService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PlayerRoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads roles by game environment id', () => {
    let result: PlayerRole[] | undefined;

    service.findAll('env-1').subscribe((value) => {
      result = value;
    });

    const request = httpMock.expectOne(`${environment.API_URL}/playerRole/gameEnv/env-1`);
    expect(request.request.method).toBe('GET');
    request.flush([new PlayerRole('1', 'Doctor')]);

    expect(result?.[0].name).toBe('Doctor');
  });

  it('creates a role for a game environment', () => {
    service.create('Pilot', 'env-1').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/playerRole/gameEnv/env-1`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'Pilot' });
    request.flush(new PlayerRole('2', 'Pilot'));
  });

  it('deletes a role', () => {
    service.delete('role-1').subscribe();

    const request = httpMock.expectOne(`${environment.API_URL}/playerRole/role-1`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });
});
