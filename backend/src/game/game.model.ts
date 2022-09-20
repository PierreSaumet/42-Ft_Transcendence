export class GameManager {
    games: GameData[] = [];

    newGame(id: number, player_id: string, specialMode: boolean, username: string): GameData {
        if (this.getGame(id))
            return this.getGame(id);
        const gameData = new GameData(id,
            'waiting',800,600,player_id,'',username,'',0,0,250,250,100,100,20,10,300,300,2,0,10,specialMode);
        this.games.push(gameData);
        return gameData;
    }

    getGame(id: number): GameData {
        return this.games.find(gameData => gameData.id == id);
    }

    getAllGames(): GameData[] {
        return this.games;
    }

    isUserInGame(id: string): boolean {
        const games = this.getAllGames()
        for (let i = 0; i < games.length; i++) {
            if (games[i].p1_id === id || games[i].p2_id === id) {
                return (true)
            }
        }
        return (false)
    }

    getGameFromSocket(id:string): GameData {
        const games = this.getAllGames()
        for (let i = 0; i < games.length; i++) {
            if (games[i].sockets_id.indexOf(id) !== -1)
                return games[i]
        }
        return null
    }

    getGameFromUser(id: string): GameData {
        const games = this.getAllGames()
        for (let i = 0; i < games.length; i++) {
            if (games[i].p1_id == id || games[i].p2_id == id)
                return (games[i])
        }
        return (null)
    }

    constructor () {}
}

export class GameData {
    id: number;
    status: string;
    sockets_id: string[] = [];
    canvas_w: number;
    canvas_h: number;
    p1_id: string;
    p2_id: string;
    p1_username: string;
    p2_username: string;
    score_p1: number;
    score_p2: number;
    pad1_y: number;
    pad2_y: number;
    pad1_h: number;
    pad2_h: number;
    pad_w: number;
    pad_d: number;
    ball_x: number;
    ball_y: number;
    ball_dx: number;
    ball_dy: number;
    ball_r: number;
    specialMode: boolean;

    constructor (id: number,
        status: string,
        canvas_w: number,
        canvas_h: number,
        p1_id: string,
        p2_id: string,
        p1_username: string,
        p2_username: string,
        score_p1: number,
        score_p2: number,
        pad1_y: number,
        pad2_y: number,
        pad1_h: number,
        pad2_h: number,
        pad_w: number,
        pad_d: number,
        ball_x: number,
        ball_y: number,
        ball_dx: number,
        ball_dy: number,
        ball_r: number,
        specialMode: boolean) {
        this.id = id;
        this.status = status;
        this.canvas_w = canvas_w;
        this.canvas_h = canvas_h;
        this.p1_id = p1_id;
        this.p2_id = p2_id;
        this.p1_username = p1_username;
        this.p2_username = p2_username;
        this.score_p1 = score_p1;
        this.score_p2 = score_p2;
        this.pad1_y = pad1_y;
        this.pad2_y = pad2_y;
        this.pad1_h = pad1_h;
        this.pad2_h = pad2_h; 
        this.pad_w = pad_w;
        this.pad_d = pad_d;
        this.ball_x = ball_x;
        this.ball_y = ball_y;
        this.ball_dx = ball_dx;
        this.ball_dy = ball_dy;
        this.ball_r = ball_r;
        this.specialMode = specialMode
    }

    movePad(player_id: string, key: string) {
        // // // // console.log(this.p1_id, '|', this.p2_id, '|', player_id,'\nsock\n',this.sockets_id)
        if (player_id == this.p1_id) {
            if (key == "ArrowUp" && this.pad1_y > 0)
                this.pad1_y -= this.pad_d;
            if (key == "ArrowDown" && this.pad1_y + this.pad1_h < this.canvas_h)
                this.pad1_y += this.pad_d;
        } else if (player_id == this.p2_id) {
            if (key == "ArrowUp" && this.pad2_y > 0)
                this.pad2_y -= this.pad_d;
            if (key == "ArrowDown" && this.pad2_y + this.pad2_h < this.canvas_h)
                this.pad2_y += this.pad_d;
        }
    }

    moveBall() {
        if (this.ball_x + this.ball_dx >= this.canvas_w - this.ball_r) {
            this.score_p1 += 1;
            this.ball_x = 300;
            this.ball_y = 300;
            this.ball_dx = -2;
            this.ball_dy = 0;
            if (this.specialMode == true && this.pad1_h > 20)
                this.pad1_h -= 10
        }
        if (this.ball_x + this.ball_dx <= this.ball_r) {
            this.score_p2 += 1;
            this.ball_x = 300;
            this.ball_y = 300;
            this.ball_dx = 2;
            this.ball_dy = 0;
            if (this.specialMode == true && this.pad2_h > 20)
                this.pad2_h -= 10
        }
        if ((this.ball_x + this.ball_dx - this.pad_w <= this.ball_r ) && (this.ball_y + this.ball_r >= this.pad1_y && this.ball_y - this.ball_r <= this.pad1_y + this.pad1_h)) {
            if (this.ball_y - this.ball_r > this.pad1_y + 2 * this.pad1_h / 3) {
                this.ball_dy -= this.ball_dy > 0 ? 1 : -1;
            } else if (this.ball_y + this.ball_r < this.pad1_y + this.pad1_h / 3){
                this.ball_dy += this.ball_dy > 0 ? 1 : -1;
            }
            if (this.ball_dx < 0)
                this.ball_dx *= -1;
        } else if ((this.ball_x + this.ball_dx >= this.canvas_w - this.ball_r - this.pad_w) && (this.ball_y + this.ball_r >= this.pad2_y && this.ball_y - this.ball_r <= this.pad2_y + this.pad2_h)) {
            if (this.ball_y - this.ball_r > this.pad2_y + 2 * this.pad2_h / 3) {
                this.ball_dy -= this.ball_dy > 0 ? 1 : -1;
            } else if (this.ball_y + this.ball_r < this.pad2_y + this.pad2_h / 3){
                this.ball_dy += this.ball_dy > 0 ? 1 : -1;
            }
            if (this.ball_dx > 0)
                this.ball_dx *= -1;
        }
        if (this.ball_y + this.ball_dy >= this.canvas_h - this.ball_r || this.ball_y + this.ball_dy < this.ball_r) {
            this.ball_dy *= -1;
        }
        this.ball_x += this.ball_dx;
        this.ball_y += this.ball_dy;
    }
}