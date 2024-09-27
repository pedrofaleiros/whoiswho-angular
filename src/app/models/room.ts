export interface User {
    id: string;
    username: string;
}

export enum RoomStatus {
    IDLE = 'IDLE',
    ACTIVE = 'PLAYING',
}

export interface Room {
    id: string;
    owner: User;
    users: User[];
    status: RoomStatus;
    impostors: number;
    includeDefaultGameEnvs: boolean;
    includeUserGameEnvs: boolean;
}