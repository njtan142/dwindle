import { Server } from 'socket.io';
import { setupSocketEvents } from '@/services/socket/socket-events';

export const setupSocket = (io: Server) => {
  setupSocketEvents(io);
};
