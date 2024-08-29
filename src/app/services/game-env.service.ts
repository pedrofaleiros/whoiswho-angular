import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GameEnv } from '../models/game-env';

@Injectable({
  providedIn: 'root'
})
export class GameEnvService {

  API_URL = "http://192.168.0.129:8080/gameEnv"
  httpClient = inject(HttpClient)

  constructor() { }

  findAll() {
    return this.httpClient.get<GameEnv[]>(this.API_URL)
  }

  findById(id: string) {
    return this.httpClient.get<GameEnv>(`${this.API_URL}/${id}`)
  }

  delete(id: string) {
    return this.httpClient.delete(`${this.API_URL}/${id}`)
  }

  create(name: string) {
    return this.httpClient.post<GameEnv>(this.API_URL, { name })
  }

  update(gameEnv: GameEnv) {
    return this.httpClient.put<GameEnv>(`${this.API_URL}/${gameEnv.id}`,
      { name: gameEnv.name }
    )
  }
}
