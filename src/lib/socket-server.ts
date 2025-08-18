// Helper to access the global socket.io instance
export const getIO = () => {
  const globalAny: any = global as any;
  return globalAny.socketIOInstance;
};

// For backward compatibility
export const io = getIO();