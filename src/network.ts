import Peer, { type DataConnection } from 'peerjs';
import { useGameStore } from './store';

// ─── ICE Server config (STUN + free TURN) ─────────────────────────────────
// Using multiple public STUN servers for reliability across different networks
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

// PeerJS config — use reliable public broker server with proper ICE
const PEER_CONFIG = {
  // Use PeerJS cloud server (most reliable public option)
  host: '0.peerjs.com',
  port: 443,
  secure: true,
  path: '/',
  debug: 1, // 0=none, 1=errors, 2=warnings, 3=all
  config: {
    iceServers: ICE_SERVERS,
    iceTransportPolicy: 'all' as RTCIceTransportPolicy,
    sdpSemantics: 'unified-plan',
  },
};

// Timeout for connection attempts (ms)
const CONNECT_TIMEOUT = 15000;
const JOIN_TIMEOUT = 20000;

class NetworkManager {
  peer: Peer | null = null;
  connections: DataConnection[] = [];
  roomId: string | null = null;
  isHost: boolean = false;
  private _positionThrottle = 0;

  // ─── Destroy old peer before creating new one ───────────────────────────
  private destroyPeer() {
    if (this.peer) {
      try { this.peer.destroy(); } catch (_) {}
      this.peer = null;
    }
    this.connections = [];
    this.roomId = null;
  }

  // ─── Generate Short ID ──────────────────────────────────────────────────
  private generateShortId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `LQ-${id}`; // Prefix with LQ to avoid collisions
  }

  // ─── Create a new Peer with fallback ────────────────────────────────────
  private createPeer(customId?: string): Promise<Peer> {
    return new Promise((resolve, reject) => {
      const peerId = customId || this.generateShortId();
      const peer = new Peer(peerId, PEER_CONFIG);

      const timeout = setTimeout(() => {
        peer.destroy();
        // Fallback: try without custom config (use PeerJS defaults)
        console.warn('[Network] Primary server timeout, trying fallback...');
        const fallback = new Peer(peerId);
        const fbTimeout = setTimeout(() => {
          fallback.destroy();
          reject(new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'));
        }, CONNECT_TIMEOUT);
        fallback.on('open', () => { clearTimeout(fbTimeout); resolve(fallback); });
        fallback.on('error', (e) => { clearTimeout(fbTimeout); reject(e); });
      }, CONNECT_TIMEOUT);

      peer.on('open', () => { clearTimeout(timeout); resolve(peer); });
      peer.on('error', (e) => {
        clearTimeout(timeout);
        // On broker error, try fallback without config
        console.warn('[Network] Primary peer error, trying fallback...', e.type);
        peer.destroy();
        const fallback = new Peer(peerId);
        const fbTimeout = setTimeout(() => {
          fallback.destroy();
          reject(new Error('Koneksi gagal. Coba lagi dalam beberapa detik.'));
        }, CONNECT_TIMEOUT);
        fallback.on('open', () => { clearTimeout(fbTimeout); resolve(fallback); });
        fallback.on('error', (fe) => { clearTimeout(fbTimeout); reject(fe); });
      });
    });
  }

  // ─── HOST: Create room ───────────────────────────────────────────────────
  initHost = async (): Promise<string> => {
    this.destroyPeer();
    const peer = await this.createPeer();
    this.peer = peer;
    this.isHost = true;
    this.roomId = peer.id;

    // Listen for incoming connections
    peer.on('connection', (conn) => {
      console.log('[Network] New player connecting:', conn.peer);
      this.connections.push(conn);
      this.setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('[Network] Host peer error:', err);
    });

    console.log('[Network] Room created:', peer.id);
    return peer.id;
  };

  // ─── GUEST: Join room ────────────────────────────────────────────────────
  joinRoom = async (id: string): Promise<void> => {
    // Clean the room ID — remove spaces/newlines users might accidentally paste
    const cleanId = id.trim().replace(/\s+/g, '');
    if (!cleanId) throw new Error('Kode ruangan kosong');

    this.destroyPeer();
    const peer = await this.createPeer();
    this.peer = peer;

    return new Promise((resolve, reject) => {
      console.log('[Network] Attempting to join room:', cleanId);

      // Retry connection up to 3 times
      let attempts = 0;
      const maxAttempts = 3;

      const tryConnect = () => {
        attempts++;
        console.log(`[Network] Connection attempt ${attempts}/${maxAttempts}`);

        const conn = peer.connect(cleanId, {
          reliable: true,
          serialization: 'json',
        });

        const timeout = setTimeout(() => {
          console.warn(`[Network] Attempt ${attempts} timed out`);
          if (attempts < maxAttempts) {
            tryConnect();
          } else {
            peer.destroy();
            reject(new Error(`Tidak bisa terhubung ke ruangan "${cleanId}". Pastikan host sudah membuat ruangan dan kode benar.`));
          }
        }, JOIN_TIMEOUT / maxAttempts);

        conn.on('open', () => {
          clearTimeout(timeout);
          this.connections.push(conn);
          this.setupConnection(conn);
          console.log('[Network] Successfully connected to room:', cleanId);
          resolve();
        });

        conn.on('error', (err) => {
          clearTimeout(timeout);
          console.error('[Network] Connection error:', err);
          if (attempts < maxAttempts) {
            setTimeout(tryConnect, 1000);
          } else {
            reject(new Error(`Gagal terhubung: ${(err as any).message || err}`));
          }
        });
      };

      tryConnect();

      // Global timeout for all attempts combined
      setTimeout(() => {
        if (this.connections.length === 0) {
          peer.destroy();
          reject(new Error(`Waktu habis. Host mungkin offline atau kode salah.`));
        }
      }, JOIN_TIMEOUT + 2000);
    });
  };

  // ─── Setup data channel ──────────────────────────────────────────────────
  setupConnection = (conn: DataConnection) => {
    conn.on('data', (data: any) => {
      if (!data || !data.type) return;

      if (data.type === 'position') {
        const defaultAvatar = { skinColor: '#f5cba7', shirtColor: '#2980b9', pantsColor: '#2c3e50', accessory: 'none' as const };
        const originPeerId = data.peerId || conn.peer;
        
        useGameStore.getState().setOtherPlayerPosition(
          originPeerId,
          data.position,
          data.rotation,
          data.name || 'Pemain',
          data.avatar || { skinColor: '#f1c27d', shirtColor: '#3498db', pantsColor: '#2c3e50', accessory: 'none' },
          data.currentLevel || 1
        );

        // If I am the host, relay this position to all other connected clients
        if (this.isHost) {
          this.connections.forEach(c => {
            if (c !== conn && c.open) {
              try { c.send(data); } catch (_) {}
            }
          });
        }
      } else if (data.type === 'disconnect') {
        // If a client receives a relayed disconnect
        const originPeerId = data.peerId || conn.peer;
        useGameStore.getState().removeOtherPlayer(originPeerId);
        
        if (this.isHost) {
          this.connections.forEach(c => {
            if (c !== conn && c.open) {
              try { c.send(data); } catch (_) {}
            }
          });
        }
      }
    });

    const handleDisconnect = () => {
      console.log('[Network] Player disconnected:', conn.peer);
      this.connections = this.connections.filter(c => c !== conn);
      useGameStore.getState().removeOtherPlayer(conn.peer);

      // If I am the host, notify other clients that this player disconnected
      if (this.isHost) {
        const disconnectMsg = { type: 'disconnect', peerId: conn.peer };
        this.connections.forEach(c => {
          if (c.open) {
            try { c.send(disconnectMsg); } catch (_) {}
          }
        });
      }
    };

    conn.on('close', handleDisconnect);
    conn.on('error', (err) => {
      console.error('[Network] Data channel error:', err);
      handleDisconnect();
    });
  };

  // ─── Broadcast position (throttled to ~20fps to save bandwidth) ─────────
  broadcastPosition = (pos: [number, number, number], rot: number) => {
    if (this.connections.length === 0) return;

    const now = Date.now();
    if (now - this._positionThrottle < 50) return; // ~20fps
    this._positionThrottle = now;

    const state = useGameStore.getState();
    const data = {
      type: 'position',
      peerId: this.peer?.id,
      position: pos,
      rotation: rot,
      name: state.playerName,
      avatar: state.avatarConfig,
      currentLevel: state.currentLevel,
    };

    this.connections.forEach(conn => {
      if (conn.open) {
        try { conn.send(data); } catch (_) {}
      }
    });
  };

  // ─── Disconnect cleanly ──────────────────────────────────────────────────
  disconnect = () => {
    this.destroyPeer();
    console.log('[Network] Disconnected');
  };

  // ─── Check if currently connected to anyone ──────────────────────────────
  get isConnected(): boolean {
    return this.connections.some(c => c.open);
  }
}

export const network = new NetworkManager();
