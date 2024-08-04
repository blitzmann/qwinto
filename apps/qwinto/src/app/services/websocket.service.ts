// src\app\services\websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';

const CHAT_URL = 'ws://localhost:3000';

export interface Message {
  action: string;
  payload?: any;
}

// @Injectable()
// export class WebsocketService {
//   private subject!: AnonymousSubject<MessageEvent>;
//   public messages: Subject<Message>;

//   constructor() {

//     this.messages = <Subject<Message>>this.connect(CHAT_URL).pipe(
//       map((response: MessageEvent): Message => {
//         console.log(response.data);
//         let data = JSON.parse(response.data);
//         return data;
//       })
//     );
//   }

//   public connect(url: string): AnonymousSubject<MessageEvent> {
//     if (!this.subject) {
//       this.subject = this.create(url);
//       console.log('Successfully connected: ' + url);
//     }
//     return this.subject;
//   }

//   private create(url: string): AnonymousSubject<MessageEvent> {
//     let ws = new WebSocket(url);
//     let observable = new Observable((obs: Observer<MessageEvent>) => {
//       ws.onmessage = obs.next.bind(obs);
//       ws.onerror = obs.error.bind(obs);
//       ws.onclose = obs.complete.bind(obs);
//       return ws.close.bind(ws);
//     });
//     let observer: Observer<MessageEvent<any>> = {
//       error: () => {
//         debugger;
//       },
//       complete: () => {
//         debugger;
//       },
//       next: (data: Object) => {
//         console.log('Message sent to websocket: ', data);
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.send(JSON.stringify(data));
//         }
//       },
//     };
//     return new AnonymousSubject<MessageEvent>(observer, observable);
//   }
// }

@Injectable()
export class WebsocketService {
  public messages: any;

  // constructor() {
  //   this.messages = webSocket<Message>({
  //     url: CHAT_URL,
  //     serializer: (msg) => {
  //       console.log('%c ↑', 'color: #bada55', msg);
  //       return JSON.stringify(msg);
  //     },
  //     deserializer(data) {
  //       const msg = JSON.parse(data.data);
  //       console.log('%c ↓', 'color: #d5cbec', msg);
  //       return msg;
  //     },
  //   });
  // }
}
