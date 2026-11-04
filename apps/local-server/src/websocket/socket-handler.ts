import { Server as SocketIOServer, Socket } from 'socket.io';

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    const { outletId, station } = socket.handshake.query;
    console.log(`[Bitechez Socket] Device connected: ${socket.id} (Outlet: ${outletId}, Station: ${station})`);

    if (outletId) {
      socket.join(`outlet:${outletId}`);
      if (station) {
        socket.join(`outlet:${outletId}:station:${station}`);
      }
    }

    // Broadcast handlers
    socket.on('broadcast:event', (data: { eventType: string; payload: unknown; outletId: string }) => {
      console.log(`[Bitechez Socket] Broadcasting ${data.eventType} to outlet:${data.outletId}`);
      socket.to(`outlet:${data.outletId}`).emit(data.eventType, data.payload);
    });

    socket.on('disconnect', () => {
      console.log(`[Bitechez Socket] Device disconnected: ${socket.id}`);
    });
  });
}

