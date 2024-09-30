import { GameEnv } from "./game-env";
import { PlayerRole } from "./player-role";
import { User } from "./room";

export interface Game {
    id: string;
    gameEnvironment: GameEnv;
    gamePlayers: GamePlayer[];
}

export interface GamePlayer {
    id: string;
    user: User;
    playerRole: PlayerRole | null;
    impostor: boolean;
}