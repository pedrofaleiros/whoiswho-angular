import { Injectable } from '@angular/core';

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

  players: string[] = []
  useDefaultGameEnvs = true;
  useUserGameEnvs = true;
  impostors: number = 1

  constructor() {
    const lsPlayers = localStorage.getItem(this.playersKey);
    const useDefault = localStorage.getItem(this.useDefaultKey) ?? "false";
    const useUser = localStorage.getItem(this.useUserKey) ?? "false";
    const lsImpostors = localStorage.getItem(this.impostorsKey);

    if (lsPlayers) {
      this.players = JSON.parse(lsPlayers)
    }
    this.useDefaultGameEnvs = (useDefault === "true")
    this.useUserGameEnvs = (useUser === "true")
    if (lsImpostors !== null) {
      this.impostors = +lsImpostors
    }
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

  clear() {
    this.setUseDefault(true)
    this.setUseUser(true)
    this.setImpostors(1)
    this.players = []
    localStorage.setItem(this.playersKey, JSON.stringify(this.players));
  }
}
