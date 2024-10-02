import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LocalGame } from '../models/local-game';
import { CreateLocalGame } from '../models/create-local-game';
import { environment } from '../../environment/environment';

interface Player {
  id: string
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class LocalGameService {

  private playersKey = 'players';
  private useDefaultKey = 'useDefaultGameEnvs';
  private useUserKey = 'useUserGameEnvs';
  private impostorsKey = 'impostors';
  private localGameKey = 'localGame';

  API_URL = `${environment.API_URL}/game`
  httpClient = inject(HttpClient)

  players: string[] = []
  useDefaultGameEnvs = true;
  useUserGameEnvs = true;
  impostors: number = 1

  game = new LocalGame("", [])

  constructor() {
    const lsPlayers = localStorage.getItem(this.playersKey);
    const useDefault = localStorage.getItem(this.useDefaultKey) ?? "false";
    const useUser = localStorage.getItem(this.useUserKey) ?? "false";
    const lsImpostors = localStorage.getItem(this.impostorsKey);
    const auxLocalGame = localStorage.getItem(this.localGameKey)

    if (lsPlayers) {
      this.players = JSON.parse(lsPlayers)
    }
    this.useDefaultGameEnvs = (useDefault === "true")
    this.useUserGameEnvs = (useUser === "true")
    if (lsImpostors !== null) {
      this.impostors = +lsImpostors
    }
    if (auxLocalGame) {
      this.game = JSON.parse(auxLocalGame)
    }
  }

  getGameData(): CreateLocalGame {
    return new CreateLocalGame(this.players, this.impostors, this.getUseUser(), this.getUseDefault())
  }

  startGame(data: CreateLocalGame) {
    return this.httpClient.post<LocalGame>(this.API_URL, data)
  }

  getImpostors() {
    return this.impostors
  }

  setImpostors(num: number) {
    this.impostors = num
    localStorage.setItem(this.impostorsKey, this.impostors.toString());
  }

  getUseDefault() {
    return this.useDefaultGameEnvs
  }
  setUseDefault(value: boolean) {
    localStorage.setItem(this.useDefaultKey, value ? "true" : "false");
    this.useDefaultGameEnvs = value
  }

  getUseUser() {
    return this.useUserGameEnvs
  }

  setUseUser(value: boolean) {
    localStorage.setItem(this.useUserKey, value ? "true" : "false");
    this.useUserGameEnvs = value
  }

  addPlayer(name: string) {
    this.players.push(name)
    localStorage.setItem(this.playersKey, JSON.stringify(this.players));
  }

  removePlayer(index: number) {
    if (index > -1 && index < this.players.length) {
      this.players.splice(index, 1)
      localStorage.setItem(this.playersKey, JSON.stringify(this.players));
    }
  }

  setGame(data: LocalGame) {
    this.game = data
    localStorage.setItem(this.localGameKey, JSON.stringify(this.game))
  }

  clear() {
    this.setUseDefault(true)
    this.setUseUser(true)
    this.setImpostors(1)
    this.players = []
    localStorage.setItem(this.playersKey, JSON.stringify(this.players));
    this.setGame(new LocalGame("", []))
  }
}
