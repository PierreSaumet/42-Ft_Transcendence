import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameData, GameManager } from './game.model'
import { Interval } from '@nestjs/schedule'
import { UserService } from 'src/user/user.service';

@WebSocketGateway(8081, { cors: true, namespace: '/game'})
export class GameGateway implements OnGatewayInit {

  constructor(private readonly userService: UserService) {}

  gameManager = new GameManager()
  public static clients: Socket[] = [];

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('GameGateway');

  async handleConnection(client: Socket) {
    GameGateway.clients.push(client);
  }

  async handleDisconnect(client: Socket){
    // // // // console.log('DISCONNECT')
    const game = this.gameManager.getGameFromSocket(client.id)
    if (game && game.sockets_id.indexOf(client.id) >= 0 && game.sockets_id.indexOf(client.id) < 2) {
      // // // // console.log(game)
      // // // // console.log(client.id)
      // // // console.log('DISCONNECT', client.id)
      game.status ='ended'
      let winner = game.score_p1 > game.score_p2 ? game.p1_id : game.p2_id;
      if (game.score_p1 == game.score_p2)
        winner = game.sockets_id.indexOf(client.id) === 0 ? game.p2_id : game.p1_id
      let game_test = {id_p1: game.p1_id, score_p1: game.score_p1, id_p2: game.p2_id, score_p2: game.score_p2, winner: winner, id_game: game.id};
      this.userService.updateHistory(game.p1_id, game_test)
      for (let i = 0; i < game.sockets_id.length; i++) {
        if (i < 2)
          GameGateway.clients.find(client => client.id === game.sockets_id[i])?.emit('gameEnd', game);
      }
      // client.emit('pushGame', game)
      const games = this.gameManager.getAllGames()
      games.splice(games.indexOf(game), 1);
    }
    client.disconnect()
  }

  afterInit(server: any) {
    this.logger.log('Initialized');
  }

  async countDownTimer(time: number, game: any) {
    if(time > 0) {
        setTimeout(() => {
            time -= 1
            game.sockets_id.forEach(socket_id => {
              GameGateway.clients.find(client => client.id === socket_id)?.emit('countDown', time);
            })
            this.countDownTimer(time, game)
        }, 1000)
    }
    else
      game.status = 'play'
  }

  @SubscribeMessage('init')
  init(client: Socket, message: { id: number, player_id: string, specialMode: boolean, username: string }) {
    // // // // console.log('init', message.id)
    if (message.id !== 0) {
      // console.log('int',message.username)
      let game = this.gameManager.newGame(message.id, message.player_id, message.specialMode, message.username);
      // // // // console.log(game.p1_id,'|', game.p2_id,'|', message.player_id)
      if (game.sockets_id.indexOf(client.id) === -1) {
        game.sockets_id.push(client.id)
      }
      if (game.p1_id == '') {
        game.p1_id = message.player_id;
        game.status = 'waiting'
        game.p1_username = message.username
        // console.log('intp1',message.username)
    } else if (game.p1_id != message.player_id && game.p2_id == '') {
        game.p2_id = message.player_id;
        game.p2_username = message.username
        // console.log('intp2',message.username)
        game.status = 'start';
        // // // // console.log(game)
        // this.userService.putgay('345')
        game.sockets_id.forEach(socket_id => {
          GameGateway.clients.find(client => client.id === socket_id)?.emit('updateState', game);
        })
        this.countDownTimer(4, game);

      }
      // // // // console.log(game.p1_id,'|', game.p2_id,'|', message.player_id)
      // // // // console.log(game)
    }
    else {
      this.gameManager.getAllGames().forEach(game => {
        game.sockets_id.forEach(socket_id => {
          GameGateway.clients.find(client => client.id === socket_id)?.emit('newGame', { sendId: game.id, status: 'play', specialMode: message.specialMode});
        })
      })
    }
  }

  @Interval(10)
  sendGameData() {
    this.gameManager.getAllGames().forEach(game => {
      if (game.status == 'play' || game.status == 'start') {
        // const truc = this.userService.getUserStatus(game.p1_id)
        // // // // console.log('tru  =', truc)

        if (game.status == 'play')
          game.moveBall();
        if (game.score_p1 == 2 || game.score_p2 == 2) {
          // // // // console.log('INTERVAL')
          game.status = 'ended'
          let winner = game.score_p1 >= game.score_p2 ? game.p1_id : game.p2_id;
          let game_test = {id_p1: game.p1_id, score_p1: game.score_p1, id_p2: game.p2_id, score_p2: game.score_p2, winner: winner, id_game: game.id};
          // // console.log('INTERVAL', )
          this.userService.updateHistory(game.p1_id, game_test)
          
          game.sockets_id.forEach(socket_id => {
            GameGateway.clients.find(client => client.id === socket_id)?.emit('gameEnd', game )
          });
          const games = this.gameManager.getAllGames();
          let game_index = games.indexOf(game)
          games.splice(game_index, 1);
        }
        else {
          game.sockets_id.forEach(socket_id => {
            GameGateway.clients.find(client => client.id === socket_id)?.emit('broadcast', game );
          })
        }
      }
    });
  }

  @SubscribeMessage('triage')
  triage(client: Socket, message: { id: number, player_id: string, specialMode: boolean, username: string}) {
    // JE DEVIENNE FOU
    this.gameManager.getAllGames().forEach(game => {
      if(game.status === 'play' && (game.p1_id == message.player_id || game.p2_id == message.player_id)) {
        // // // // console.log('TRIAGE')

        // // console.log('TRIAGE', client.id)
        game.status = 'ended'
          let winner = game.score_p1 > game.score_p2 ? game.p1_id : game.p2_id;
          if (game.score_p1 == game.score_p2)
              winner = message.player_id;
          let game_test = {id_p1: game.p1_id, score_p1: game.score_p1, id_p2: game.p2_id, score_p2: game.score_p2, winner: winner, id_game: game.id};
          if (winner === message.player_id)
            this.userService.updateHistory(message.player_id, game_test)
        game.sockets_id.forEach(socket_id => {
          GameGateway.clients.find(client => client.id === socket_id)?.emit('gameEnd', game );
        })
        const games = this.gameManager.getAllGames();
        let game_index = games.indexOf(game)
        games.splice(game_index, 1);
      }
    })
    // // // // console.log(message.id)
    // const games = this.gameManager.getAllGames();
    // // // // console.log('---GAMES TRIAGE----',message.player_id,games)
    // // // // console.log(message.player_id, '|', message.specialMode)
    if (message.id !== null && message.id !== 0) {
      let game = this.gameManager.newGame(message.id, message.player_id, message.specialMode, message.username);
      if(game.status !== 'lobby')
        this.init(client, {id:message.id, player_id:message.player_id, specialMode:message.specialMode, username:message.username})
    }
    else {
      this.gameManager.getAllGames().forEach(game => {
        if (game.p1_id === message.player_id || game.p2_id === message.player_id)
          this.init(client, {id:game.id, player_id:message.player_id, specialMode:message.specialMode, username:message.username})
      })
    }
  }

  @SubscribeMessage('keyDown')
  keyDown(client: Socket, message: { id:number, player_id: string, key: string }) {
    // // // // console.log('---ALL GAMES---')
    // // // // console.log(this.gameManager.getAllGames())
    let game = this.gameManager.getGame(message.id);
    if (game && game.status == 'play' && message.key == "p" && (message.player_id == game.p1_id || message.player_id == game.p2_id)) {
      game.status = 'pause';
      this.countDownTimer(10, game);
    }
    if (game && (message.key == "ArrowUp" || message.key == "ArrowDown"))
      game.movePad(message.player_id, message.key);
      // // // // // console.log(game.p1_id,'|',game.p2_id,'|',message.player_id)
  }

  @SubscribeMessage('getGameId')
  getGameId(client: Socket, message: {player_id: string, specialMode: boolean, username: string}) {
    const games = this.gameManager.getAllGames();
    // // // // console.log('---GAMES----',message.player_id,games)
    // // // // console.log(message.player_id, '|', message.specialMode)
    for (let i = 0; i < games.length; i++) {
      if (games[i].p1_id !== '' && games[i].p2_id === '' && games[i].specialMode === message.specialMode) {
        // // // // console.log('newgame')
        client.emit('newGame', { sendId: games[i].id, status: games[i].status, specialMode: message.specialMode, username: message.username})
        return;
      }
    } 
    const id = parseInt(String(Math.floor(100000 + Math.random() * 900000)), 10);
    this.gameManager.newGame(id, message.player_id, message.specialMode, message.username);
    client.emit('newGame', { sendId: id, status: 'waiting', specialMode: message.specialMode, username: message.username});
  }

  @SubscribeMessage('checkUserStatus')
  async checkUserStatus(client: Socket, message: {player_id: string}) {

    const game = this.gameManager.getGameFromUser(message.player_id)
    if (game) {
      if (game.p1_id === '' || game.p2_id === '')
        return
      const status_p1 = await this.userService.getUserStatus(game.p1_id)
      const status_p2 = await this.userService.getUserStatus(game.p2_id)
      // // // // console.log('check status P1 :',game.p1_id, status_p1)
      // // // // console.log('check status P2 :',game.p2_id, status_p2)
      if (game.status !== 'ended' && (status_p1 !== 'in_game' || status_p2 !== 'in_game')) {
        // // // // console.log('STATUS')

        // // console.log('STATUS', client.id)
        game.status = 'ended'
        let winner = game.score_p1 > game.score_p2 ? game.p1_id : game.p2_id;
        if (game.score_p1 == game.score_p2)
            winner = status_p1 === 'in_game' ? game.p1_id : game.p2_id
        let game_test = {id_p1: game.p1_id, score_p1: game.score_p1, id_p2: game.p2_id, score_p2: game.score_p2, winner: winner, id_game: game.id};
        this.userService.updateHistory(message.player_id, game_test)
        game.sockets_id.forEach(socket_id => {
          GameGateway.clients.find(client => client.id === socket_id)?.emit('gameEnd', game );
        })
        const games = this.gameManager.getAllGames();
        let game_index = games.indexOf(game)
        games.splice(game_index, 1);
      }
    }
  }

  @SubscribeMessage('disconnect')
  disconnect(client: Socket, message: {id: number}) {
    let game = this.gameManager.getGame(message.id);
    if (game) {
      let socket_index = game.sockets_id.indexOf(client.id)
      if (socket_index !== -1)
      {
        game.sockets_id.splice(socket_index, 1)
      }
    }
  }
} 