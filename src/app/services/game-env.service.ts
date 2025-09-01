import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameEnv } from '../models/game-env';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class GameEnvService {

  API_URL = `${environment.API_URL}/gameEnv`

  constructor(private _httpClient: HttpClient) { }

  findAll() {
    return this._httpClient.get<GameEnv[]>(this.API_URL)
  }

  findAllDefault() {
    return this._httpClient.get<GameEnv[]>(`${this.API_URL}/default`)
  }

  findById(id: string) {
    return this._httpClient.get<GameEnv>(`${this.API_URL}/${id}`)
  }

  delete(id: string) {
    return this._httpClient.delete(`${this.API_URL}/${id}`)
  }

  create(name: string) {
    return this._httpClient.post<GameEnv>(this.API_URL, { name })
  }

  update(gameEnv: GameEnv) {
    return this._httpClient.put<GameEnv>(`${this.API_URL}/${gameEnv.id}`,
      { name: gameEnv.name }
    )
  }
}
