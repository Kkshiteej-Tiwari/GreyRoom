import { Server } from "socket.io";

// In-memory stores (in production, use Redis)
const matchingQueue = {
  any: [],
  male: [],
  female: [],
};
const activeSessions = new Map();
const connectedUsers = new Map();

export default async function handler(req, res) {
  // Prevent duplicate server initialization
  if (res.socket.server.io) {
    console.log('Socket server already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');

  const io = new Server(res.socket.server, {
    pingInterval: 10000,
    pingTimeout: 5000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  res.socket.server.io = io;

  // Heartbeat middleware
  io.use((socket, next) => {
    setInterval(() => {
      socket.emit("heartbeat", "alive");
    }, 5000);
    next();
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ============ AUTHENTICATION ============
    
    // Register user with device ID and profile
    socket.on("auth:register", (data) => {
      const { deviceId, nickname, bio, gender } = data;

      if (!deviceId || !nickname) {
        return socket.emit("auth:register", { 
          success: false, 
          error: "Device ID and nickname are required" 
        });
      }

      // Check for duplicate nicknames
      const existingUser = Array.from(connectedUsers.values()).find(
        (u) => u.nickname.toLowerCase() === nickname.toLowerCase() && u.socketId !== socket.id
      );

      if (existingUser) {
        return socket.emit("auth:register", { 
          success: false, 
          error: "This nickname is already in use" 
        });
      }

      const userData = {
        socketId: socket.id,
        deviceId,
        nickname,
        bio: bio || "",
        gender: gender || "unspecified",
        createdAt: new Date(),
      };

      connectedUsers.set(socket.id, userData);
      socket.data.user = userData;

      socket.emit("auth:register", { 
        success: true, 
        data: userData 
      });
    });

    // Check if user is authenticated
    socket.on("auth:check", () => {
      const user = connectedUsers.get(socket.id);
      socket.emit("auth:check", { 
        authenticated: !!user, 
        data: user || null 
      });
    });

    // Logout user
    socket.on("auth:logout", () => {
      removeFromQueue(socket.id);
      connectedUsers.delete(socket.id);
      socket.data.user = null;
      socket.emit("auth:logout", { success: true });
    });

    // ============ MATCHING QUEUE ============

    // Join matching queue
    socket.on("queue:join", (data) => {
      const user = connectedUsers.get(socket.id);
      
      if (!user) {
        return socket.emit("queue:join", { 
          success: false, 
          error: "Please register first" 
        });
      }

      const { preferredGender } = data || {};
      const queueType = preferredGender || "any";

      // Remove from any existing queue
      removeFromQueue(socket.id);

      // Add to appropriate queue
      const queueEntry = {
        socketId: socket.id,
        user,
        preferredGender: queueType,
        joinedAt: new Date(),
      };

      matchingQueue[queueType].push(queueEntry);
      socket.data.inQueue = queueType;

      socket.emit("queue:join", { 
        success: true, 
        queueType,
        position: matchingQueue[queueType].length 
      });

      // Try to find a match
      tryMatch(socket, queueType, io);
    });

    // Leave matching queue
    socket.on("queue:leave", () => {
      removeFromQueue(socket.id);
      socket.data.inQueue = null;
      socket.emit("queue:leave", { success: true });
    });

    // Get queue status
    socket.on("queue:status", () => {
      const queueType = socket.data.inQueue;
      if (!queueType) {
        return socket.emit("queue:status", { inQueue: false });
      }

      const position = matchingQueue[queueType].findIndex(
        (e) => e.socketId === socket.id
      );

      socket.emit("queue:status", {
        inQueue: true,
        queueType,
        position: position + 1,
        totalInQueue: matchingQueue[queueType].length,
      });
    });

    // ============ CHAT ============

    // Send message
    socket.on("chat:send", (data) => {
      const session = getSessionBySocket(socket.id);
      
      if (!session) {
        return socket.emit("chat:send", { 
          success: false, 
          error: "Not in an active chat" 
        });
      }

      const user = connectedUsers.get(socket.id);
      const message = {
        id: generateMessageId(),
        sender: user.nickname,
        content: data.message,
        timestamp: new Date(),
      };

      // Send to both participants
      session.participants.forEach((participantId) => {
        const participantSocket = io.sockets.sockets.get(participantId);
        if (participantSocket) {
          participantSocket.emit("chat:message", {
            ...message,
            isOwn: participantId === socket.id,
          });
        }
      });
    });

    // Typing indicator
    socket.on("chat:typing", () => {
      const session = getSessionBySocket(socket.id);
      if (!session) return;

      const user = connectedUsers.get(socket.id);
      const partnerId = session.participants.find((p) => p !== socket.id);
      
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit("chat:typing", { nickname: user.nickname });
        }
      }
    });

    // Leave chat / Next match
    socket.on("chat:leave", () => {
      const session = getSessionBySocket(socket.id);
      
      if (!session) {
        return socket.emit("chat:leave", { success: true });
      }

      // Notify partner
      const partnerId = session.participants.find((p) => p !== socket.id);
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit("chat:partnerLeft", {
            message: "Stranger has left the chat",
          });
        }
      }

      // Remove session
      activeSessions.delete(session.id);
      socket.emit("chat:leave", { success: true });
    });

    // Report user
    socket.on("chat:report", (data) => {
      const session = getSessionBySocket(socket.id);
      const { reason } = data;

      // In production, this would store the report
      console.log(`Report from ${socket.id}: ${reason}`);

      socket.emit("chat:report", { 
        success: true, 
        message: "Report submitted" 
      });
    });

    // ============ PLATFORM STATS ============

    socket.on("platform:stats", () => {
      const totalOnline = connectedUsers.size;
      const inQueue = Object.values(matchingQueue).reduce(
        (sum, q) => sum + q.length, 0
      );
      const inChat = activeSessions.size * 2;

      socket.emit("platform:stats", {
        online: totalOnline,
        inQueue,
        inChat,
      });
    });

    // ============ DISCONNECT ============

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Handle active chat session
      const session = getSessionBySocket(socket.id);
      if (session) {
        const partnerId = session.participants.find((p) => p !== socket.id);
        if (partnerId) {
          const partnerSocket = io.sockets.sockets.get(partnerId);
          if (partnerSocket) {
            partnerSocket.emit("chat:partnerLeft", {
              message: "Stranger has disconnected",
            });
          }
        }
        activeSessions.delete(session.id);
      }

      // Remove from queue
      removeFromQueue(socket.id);
      
      // Remove user data
      connectedUsers.delete(socket.id);
    });
  });

  res.end();
}

// ============ HELPER FUNCTIONS ============

function removeFromQueue(socketId) {
  Object.keys(matchingQueue).forEach((queueType) => {
    matchingQueue[queueType] = matchingQueue[queueType].filter(
      (e) => e.socketId !== socketId
    );
  });
}

function tryMatch(socket, queueType, io) {
  const user = connectedUsers.get(socket.id);
  if (!user) return;

  let potentialMatches = [];

  if (queueType === "any") {
    // Match with anyone in any queue
    potentialMatches = [
      ...matchingQueue.any,
      ...matchingQueue.male,
      ...matchingQueue.female,
    ].filter((e) => e.socketId !== socket.id);
  } else {
    // Match with someone looking for this gender or "any"
    const targetGender = user.gender;
    potentialMatches = [
      ...matchingQueue.any,
      ...matchingQueue[targetGender] || [],
    ].filter((e) => e.socketId !== socket.id);
  }

  if (potentialMatches.length === 0) return;

  // Get the first available match
  const match = potentialMatches[0];

  // Remove both from queues
  removeFromQueue(socket.id);
  removeFromQueue(match.socketId);

  // Create session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    id: sessionId,
    participants: [socket.id, match.socketId],
    startedAt: new Date(),
  };

  activeSessions.set(sessionId, session);

  // Notify both users
  const matchSocket = io.sockets.sockets.get(match.socketId);

  socket.emit("match:found", {
    sessionId,
    partner: {
      nickname: match.user.nickname,
      bio: match.user.bio,
    },
  });

  if (matchSocket) {
    matchSocket.emit("match:found", {
      sessionId,
      partner: {
        nickname: user.nickname,
        bio: user.bio,
      },
    });
  }
}

function getSessionBySocket(socketId) {
  for (const [, session] of activeSessions) {
    if (session.participants.includes(socketId)) {
      return session;
    }
  }
  return null;
}

function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
