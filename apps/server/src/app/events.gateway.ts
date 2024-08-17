import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  Events,
  IRoomRequest,
  IDie,
  IJoinRoomRequest,
  IPlayer,
  IPlayerSheet,
  IRoom,
  ClientEvents,
  calculateSelectableEntries,
  TEntry,
} from '@lib';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { timeout } from 'rxjs';
const { v4: uuidv4 } = require('uuid');

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.cacheManager.set('test', { test: 42 });
  }

  @SubscribeMessage(Events.CREATE_ROOM)
  async createRoom(
    @MessageBody() data: IRoomRequest,
    @ConnectedSocket() client: Socket
  ) {
    const code = await this.generateRoomCode();
    const room = this.generateRoom(code);
    this.cacheManager.set(code, room, 1000 * 60 * 60 * 24); // 12 hours
    return this.joinRoom({ ...data, roomCode: code }, client);
  }

  @SubscribeMessage(Events.JOIN_ROOM)
  async joinRoom(
    @MessageBody() data: IJoinRoomRequest,
    @ConnectedSocket() client: Socket
  ) {
    // todo: do not allow join if game has started
    const room = await this.cacheManager.get<IRoom>(data.roomCode);
    if (!room) return;

    const player = this.generatePlayer(room.code, data.playerName, client.id);

    // we set the room code to be easily identifiable by the client id
    this.cacheManager.set(`client-${client.id}`, data.roomCode, 60 * 60 * 24); // 12 hours

    if (room.players.length === 0) {
      player.isAdmin = true;
    }

    room.players.push(player);
    this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours

    await client.join(room.code);

    // we emit via server as client.to()... does not send to the client that is calling the function
    await client.to(room.code).emit(ClientEvents.PLAYER_JOINED, {
      player,
    });

    await client.emit(ClientEvents.GAME_LOAD, room);

    console.log('Player joined, emited, ', ClientEvents.PLAYER_JOINED);
    // todo: emit player joined to everyone besides the one who joined
    return { roomCode: room.code, playerID: player.id };
  }

  @SubscribeMessage(Events.RECONNECT)
  async gameState(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Reconnecting player');
    const room = await this.cacheManager.get<IRoom>(data.roomCode);

    if (room === undefined) {
      console.log('Room not found');
      return;
      // todo: send error
    }
    console.log(room);
    console.log(data);
    // todo: if player disconnected / refreshed, but is requesting game state from a room, determine how to switch over their socket connection
    const player = room.players.find((x) => x.id === data.playerID);

    if (!player) {
      console.log('Player not found');
      return; // todo: error
    }

    if (player.socketID !== client.id) {
      // need to re-associate the player with their socket and join the connection with this room
      player.socketID = client.id;
      client.join(room.code);
      this.cacheManager.set(`client-${client.id}`, data.roomCode, 60 * 60 * 24); // 12 hours
      //set room
      this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours
      // todo: re-send data to other clients about new client ID and stuff (probably not nessessary, but couldn't hurt)
    }

    await client.emit(ClientEvents.GAME_LOAD, room);
  }

  @SubscribeMessage(Events.START_GAME)
  async startGame(
    @MessageBody() data: { roomCode: string },
    @ConnectedSocket() client: Socket
  ) {
    // todo: prevent start with player count < 2
    if (!client.rooms.has(data.roomCode)) {
      // client is not part of this room... ignore / error
      console.log('Client not part of room');
      return;
    }
    const room = await this.cacheManager.get<IRoom>(data.roomCode);
    if (!room) {
      console.log('Room not found');
      return; // todo: error
    }

    if (room.gameStarted) {
      console.log('Game already started');
      // return; // todo: error
    }
    const player = room.players.find((x) => x.socketID == client.id);
    if (!player) {
      console.log('Player not found');
      return;
    }
    if (!player.isAdmin) {
      console.log('Player is not admin');
      return; // error
    }

    console.log('Game starting save logic, ', room.code);
    room.gameStarted = true;

    // set first player
    room.turn.player = room.players[0];

    this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours

    // everything checks out, send out the start game event to everyone connected to the room
    this.server.to(room.code).emit(Events.START_GAME, room.turn);
  }

  @SubscribeMessage(Events.ROLL_ATTEMPT)
  async rollAttempt(
    @MessageBody() data: IDie[],
    @ConnectedSocket() client: Socket
  ) {
    // ensure that turn can be attempted.
    const roomCode = await this.cacheManager.get<string>(`client-${client.id}`);
    if (!roomCode) {
      return; // todo: error
    }
    const room = await this.cacheManager.get<IRoom>(roomCode);

    if (!room) {
      return; // todo: error
    }

    if (room.turn.attempt.num >= room.settings.rollAttempts) {
      return; // todo: error
    }

    if (!room) {
      return; // todo: error
    }

    const player = room.players.find((x) => x.socketID == client.id);
    if (!player) {
      return; // todo: error
    }

    // check to see if this is the first attempt, in which case we will use the dice the player provides. Otherwise, we will reuse the previous dice
    // This will prevent the player from sending in different dice colors than first attempt
    const dice = room.turn.diceState.filter((x) => x.selected);
    console.log('Roll attempt', room.turn);

    // generate random values
    dice.forEach((die) => (die.value = Math.floor(Math.random() * 6) + 1));

    room.turn.attempt = {
      num: room.turn.attempt.num + 1,
      values: dice,
    };

    if (room.turn.attempt.num >= room.settings.rollAttempts) {
      // auto-finalize the roll
      room.turn.finalized = true;
      this.server.to(room.code).emit(ClientEvents.ROLL_FINALIZED);
    }
    // save room
    this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours
    console.log('Emitting player roll', room.turn.attempt);
    this.server.to(room.code).emit(ClientEvents.PLAYER_ROLL, room.turn.attempt);
  }

  @SubscribeMessage(Events.ACCEPT_ROLL)
  async acceptRoll(@ConnectedSocket() client: Socket) {
    // ensure that turn can be attempted.
    const roomCode = await this.cacheManager.get<string>(`client-${client.id}`);
    if (!roomCode) {
      return; // todo: error
    }
    const room = await this.cacheManager.get<IRoom>(roomCode);

    if (!room) {
      return; // todo: error
    }

    const player = room.players.find((x) => x.socketID == client.id);
    if (!player) {
      return; // todo: error
    }

    if (room.turn.player?.id !== player.id) {
      return; // todo: error
    }

    room.turn.finalized = true;

    // save room
    this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours

    this.server.to(room.code).emit(ClientEvents.ROLL_FINALIZED);
  }

  @SubscribeMessage(ClientEvents.DICE_SELECTED)
  async dieSelected(
    @MessageBody() data: Pick<IDie, 'color' | 'selected'>,
    @ConnectedSocket() client: Socket
  ) {
    // ensure that turn can be attempted.
    const roomCode = await this.cacheManager.get<string>(`client-${client.id}`);
    if (!roomCode) {
      return; // todo: error
    }
    const room = await this.cacheManager.get<IRoom>(roomCode);

    if (!room) {
      return; // todo: error
    }

    const player = room.players.find((x) => x.socketID == client.id);
    if (!player) {
      return; // todo: error
    }

    if (room.turn.player?.id !== player.id) {
      return; // todo: error
    }

    if (room.turn.attempt.num !== 0) {
      return; // todo: error (cannot change die selection after first attempt)
    }

    const die = room.turn.diceState.find((x) => x.color === data.color) as IDie;
    die.selected = data.selected;

    // save room
    this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours
    console.log('Emitting dice selected');
    await client.to(room.code).emit(Events.RECIEVE_DIE_SELECTED, data);
  }

  @SubscribeMessage(Events.SET_ROLL)
  async setRoll(
    @MessageBody() data: { rowKey: string; entryIdx: number },
    @ConnectedSocket() client: Socket
  ) {
    // ensure that turn can be attempted.
    const roomCode = await this.cacheManager.get<string>(`client-${client.id}`);
    if (!roomCode) {
      return; // todo: error
    }
    let room = await this.cacheManager.get<IRoom>(roomCode);

    if (!room) {
      return; // todo: error
    }

    if (!room.turn.finalized) {
      return; // todo: error
    }

    const player = room.players.find((x) => x.socketID == client.id);
    if (!player) {
      return; // todo: error
    }
    if (player.turnOver) {
      console.log('Player has already set their entry');
      return; // todo: error
    }
    const matrix = calculateSelectableEntries(room.turn.attempt, player.sheet);

    if (
      !matrix.find((x) => x.key === data.rowKey)?.entries[data.entryIdx]
        ?._selectable
    ) {
      console.log('Entry not selectable');
      return;
    }
    const entry = player.sheet.rows.find((x) => x.key === data.rowKey)?.entries[
      data.entryIdx
    ];
    if (!entry) {
      console.log('Entry not found');
      return;
    }
    entry.value = room.turn.attempt.values
      ?.map((x) => x.value)
      .reduce((acc, x) => acc + x, 0) as number;

    player.turnOver = true;
    this.server.to(room.code).emit(ClientEvents.PLAYER_SET_ENTRY, player);
    this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours

    // get fresh cache of room in case something has happened
    room = (await this.cacheManager.get<IRoom>(roomCode)) as IRoom;
    // determine if all players have set their entry
    if (!room.players.every((x) => x.turnOver)) {
      return;
    }

    // set a new player for the next turn
    const currentPlayerIndex = room.players.findIndex(
      (x) => x.id === room.turn.player?.id
    );
    const nextPlayerIndex = currentPlayerIndex + 1;
    room.turn = {
      ...room.turn,
      finalized: false,
      player: room.players[nextPlayerIndex % room.players.length],
      attempt: {
        num: 0,
        values: null,
      },
    };

    room.players.forEach((x) => (x.turnOver = false));

    // save room
    this.cacheManager.set(room.code, room, 1000 * 60 * 60 * 24); // 12 hours

    this.server.to(room.code).emit(ClientEvents.NEXT_TURN, {
      turn: room.turn,
      previousPlayer: player,
    });
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }

  handleConnection(client: any, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.warn(`Client disconnected: ${client.id}`);
  }

  private async generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
      }
    } while (await this.cacheManager.get(code));
    return code;
  }

  private generateRoom(code): IRoom {
    return {
      code,
      players: [],
      gameStarted: false,
      settings: {
        rollAttempts: 20,
        simulation: { interval: 100, minWait: 1500 },
      },
      turn: {
        finalized: false,
        attempt: {
          num: 0,
          values: null,
        },
        diceState: [
          { color: 'orange', value: 1, selected: false },
          { color: 'yellow', value: 1, selected: false },
          { color: 'purple', value: 1, selected: false },
        ],
        player: null,
      },
    };
  }

  private generatePlayer(roomCode, playerName, socketID): IPlayer {
    const playerID = uuidv4();
    const player: IPlayer = {
      id: playerID,
      socketID: socketID,
      name: playerName,
      roomCode: roomCode,
      isIdle: false,
      isAdmin: false,
      joined: new Date(),
      sheet: this.generateGameSheet(),
      turnOver: false,
    };
    // player.setSocket(socket);
    // prevents _socket from being serialized

    return player;
  }

  private generateGameSheet(): IPlayerSheet {
    return {
      failed: [
        { value: null },
        { value: null },
        { value: null },
        { value: null },
        { value: null },
      ],
      rows: [
        {
          color: 'orangered',
          key: 'orange',
          offset: 2,
          entries: [
            { value: null },
            { value: null, bonus: true },
            { value: 5 },
            null,
            { value: null },
            { value: 10, bonus: true },
            { value: null },
            { value: null },
            { value: null },
            { value: null },
          ],
        },
        {
          color: '#d1c714',
          key: 'yellow',
          offset: 1,
          entries: [
            { value: null },
            { value: null },
            { value: 4 },
            { value: null },
            { value: null },
            null,
            { value: null },
            { value: null, bonus: true },
            { value: null },
            { value: null },
          ],
        },
        {
          color: '#2e3796',
          key: 'purple',
          offset: 0,
          entries: [
            { value: null },
            { value: null },
            { value: null, bonus: true },
            { value: null },
            null,
            { value: null },
            { value: null },
            { value: null },
            { value: null },
            { value: null, bonus: true },
          ],
        },
      ],
    };
  }
}
