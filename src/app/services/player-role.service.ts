import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayerRole } from '../models/player-role';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerRoleService {

  API_URL = `${environment.API_URL}/playerRole`

  constructor(private _httpClient: HttpClient) { }

  findAll(gameEnvId: string) {
    return this._httpClient.get<PlayerRole[]>(`${this.API_URL}/gameEnv/${gameEnvId}`)
  }

  create(name: string, gameEnvId: string) {
    return this._httpClient.post<PlayerRole>(`${this.API_URL}/gameEnv/${gameEnvId}`, { name })
  }

  delete(id: string) {
    return this._httpClient.delete(`${this.API_URL}/${id}`)
  }
}
