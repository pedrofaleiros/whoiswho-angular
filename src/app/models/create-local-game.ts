export class CreateLocalGame {
    players: string[];
    impostors: number;
    includeUserGameEnvs: boolean;
    includeDefaultGameEnvs: boolean;

    constructor(
        players: string[],
        impostors: number,
        includeUserGameEnvs: boolean,
        includeDefaultGameEnvs: boolean,
    ) {
        this.players = players;
        this.impostors = impostors;
        this.includeUserGameEnvs = includeUserGameEnvs;
        this.includeDefaultGameEnvs = includeDefaultGameEnvs;
    }
}
