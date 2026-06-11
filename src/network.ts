import Peer, { type DataConnection } from 'peerjs';
import { useGameStore } from './store';

class NetworkManager {
  peer: Peer | null = null;
  connections: DataConnection[] = [];
  roomId: string | null = null;
  isHost: boolean = false;

  initHost = () => {
    return new Promise<string>((resolve, reject) => {
      this.peer = new Peer();
      this.peer.on('open', (id) => {
        this.roomId = id;
        this.isHost = true;
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.connections.push(conn);
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => reject(err));
    });
  };

  joinRoom = (id: string) => {
    return new Promise<void>((resolve, reject) => {
      this.peer = new Peer();
      this.peer.on('open', () => {
        const conn = this.peer!.connect(id);
        conn.on('open', () => {
          this.connections.push(conn);
          this.setupConnection(conn);
          resolve();
        });
        conn.on('error', (err) => reject(err));
      });
      this.peer.on('error', (err) => reject(err));
    });
  };

  setupConnection = (conn: DataConnection) => {
    conn.on('data', (data: any) => {
      if (data.type === 'position') {
        useGameStore.getState().setOtherPlayerPosition(data.peerId, data.position, data.rotation);
      }
    });

    conn.on('close', () => {
      this.connections = this.connections.filter(c => c !== conn);
      useGameStore.getState().removeOtherPlayer(conn.peer);
    });
  };

  broadcastPosition = (pos: [number, number, number], rot: number) => {
    const data = {
      type: 'position',
      peerId: this.peer?.id,
      position: pos,
      rotation: rot
    };
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(data);
      }
    });
  };
}

export const network = new NetworkManager();
