
export class LocalGame {
    gameEnv: string;
    playerRoles: GamePlayerRole[];

    constructor(gameEnv: string, playerRoles: GamePlayerRole[]) {
        this.gameEnv = gameEnv;
        this.playerRoles = playerRoles;
    }
}

export class GamePlayerRole {
    name: string;
    profession: string | null;

    constructor(name: string, profession: string | null) {
        this.name = name;
        this.profession = profession;
    }
}
