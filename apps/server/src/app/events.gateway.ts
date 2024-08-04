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
  ICreateRoomRequest,
  IDie,
  IJoinRoomRequest,
  IPlayer,
  IPlayerSheet,
  IRoom,
} from '@lib';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
const { v4: uuidv4 } = require('uuid');

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @SubscribeMessage(Events.CREATE_ROOM)
  async createRoom(
    @MessageBody() data: ICreateRoomRequest,
    @ConnectedSocket() client: Socket
  ) {
    const code = await this.generateRoomCode();
    const room = this.generateRoom(code);
    this.cacheManager.set(code, room, 60 * 60 * 24); // 12 hours
    return this.joinRoom({ ...data, roomCode: code }, client);
  }

  @SubscribeMessage(Events.JOIN_ROOM)
  async joinRoom(
    @MessageBody() data: IJoinRoomRequest,
    @ConnectedSocket() client: Socket
  ) {
    const room = await this.cacheManager.get<IRoom>(data.roomCode);
    if (!room) return;

    const player = this.generatePlayer(room.code, data.playerName, client.id);

    this.cacheManager.set(`client-${client.id}`, data.roomCode, 60 * 60 * 24); // 12 hours

    if (room.players.length === 0) player.isAdmin = true;

    room.players.push(player);

    client.join(room.code);
    client.to(room.code).emit(Events.PLAYER_JOINED, {
      player,
      players: [...room.players.values()],
    });
    // todo: emit player joined to everyone besides the one who joined
    return { roomCode: room.code, playerID: player.id };
  }

  @SubscribeMessage(Events.GAME_STATE)
  async gameState(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const room = await this.cacheManager.get<IRoom>(data.roomCode);

    if (room === undefined) {
      return;
      // todo: send error
    }

    // todo: if player disconnected / refreshed, but is requesting game state from a room, determine how to switch over their socket connection
    const player = room.players.find((x) => x.id === data.playerID);

    if (!player) {
      return; // todo: error
    }

    if (player.socketID !== client.id) {
      // need to re-associate the player with their socket and join the connection with this room
      player.socketID = client.id;
      client.join(room.code);
    }

    return {
      ...room,
      players: [...room.players.values()],
    };
  }

  @SubscribeMessage(Events.START_GAME)
  async startGame(
    @MessageBody() data: { roomCode: string },
    @ConnectedSocket() client: Socket
  ) {
    if (!client.rooms.has(data.roomCode)) {
      // client is not part of this room... ignore / error
      return;
    }
    const room = await this.cacheManager.get<IRoom>(data.roomCode);
    if (!room) {
      return; // todo: error
    }
    const player = room.players.find((x) => x.socketID == client.id);
    if (!player) {
      return;
    }
    if (!player.isAdmin) {
      return; // error
    }

    // everything checks out, send out the start game event to everyone connected to the room
    this.server.to(data.roomCode).emit(Events.START_GAME, room.turn);
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

    if (room?.turn.attempt >= room?.settings.rollAttempts) {
      return; // todo: error
    }

    // generate random values
    data.forEach((die) => (die.value = Math.floor(Math.random() * 6) + 1));

    if (!room) {
      return; // todo: error
    }

    const player = room.players.find((x) => x.socketID == client.id);
    if (!player) {
      return; // todo: error
    }

    room.turn = {
      ...room.turn,
      attempt: room.turn.attempt + 1,
      player: room.players.find((x) => x.socketID == client.id),
      die: data,
    };

    return data;
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
        rollAttempts: 2,
      },
      turn: {
        attempt: 0,
        lockedIn: false,
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
    };
    // player.setSocket(socket);
    // prevents _socket from being serialized

    return player;
  }

  private generateGameSheet(): IPlayerSheet {
    return {
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
