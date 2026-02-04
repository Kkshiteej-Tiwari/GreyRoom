/**
 * ============================================================================
 * SOCKET.IO SERVER - socket.js
 * ============================================================================
 * 
 * PURPOSE:
 * This is the WebSocket server that powers all real-time features in GreyRoom:
 * - User authentication and registration
 * - Matching queue management
 * - Real-time chat messaging
 * - Typing indicators
 * - Platform statistics
 * 
 * ARCHITECTURE:
 * This file runs as a Next.js API route that initializes a Socket.io server.
 * The server attaches to the existing HTTP server, enabling WebSocket upgrades.
 * 
 * DATA STRUCTURES (In-Memory - use Redis in production):
 * - connectedUsers: Map<socketId, UserData> - All connected users
 * - matchingQueue: { any: [], male: [], female: [] } - Users waiting for matches
 * - activeSessions: Map<sessionId, SessionData> - Active chat sessions
 * 
 * SOCKET EVENTS:
 * ┌─────────────────┬────────────────────────────────────────────────────┐
 * │ Event           │ Description                                        │
 * ├─────────────────┼────────────────────────────────────────────────────┤
 * │ auth:register   │ Register user with deviceId, nickname, gender      │
 * │ auth:check      │ Check if user is authenticated                     │
 * │ auth:logout     │ Logout and cleanup user data                       │
 * │ queue:join      │ Join matching queue with gender preference         │
 * │ queue:leave     │ Leave the matching queue                           │
 * │ queue:status    │ Get current queue position                         │
 * │ match:found     │ Emitted when a match is found                      │
 * │ chat:send       │ Send a chat message                                │
 * │ chat:message    │ Receive a chat message                             │
 * │ chat:typing     │ Typing indicator                                   │
 * │ chat:leave      │ Leave current chat                                 │
 * │ chat:partnerLeft│ Partner has left the chat                          │
 * │ platform:stats  │ Get online user counts                             │
 * └─────────────────┴────────────────────────────────────────────────────┘
 * 
 * ============================================================================
 */

import { Server } from "socket.io";

// ============================================================================
// IN-MEMORY DATA STORES
// ============================================================================
// NOTE: In production, replace these with Redis for:
// - Horizontal scaling across multiple servers
// - Data persistence across restarts
// - Better performance at scale

/**
 * Matching Queue Structure
 * 
 * Users are placed in queues based on their gender preference:
 * - any: Users who want to match with anyone
 * - male: Users who specifically want to match with males
 * - female: Users who specifically want to match with females
 */
const matchingQueue = {
  any: [],      // Users who will match with anyone
  male: [],     // Users looking specifically for males
  female: [],   // Users looking specifically for females
};

/**
 * Active Chat Sessions
 * Map<sessionId, SessionData>
 * 
 * SessionData structure:
 * {
 *   id: string,           // Unique session identifier
 *   participants: [socketId1, socketId2],  // The two users in the chat
 *   startedAt: Date       // When the session started
 * }
 */
const activeSessions = new Map();

/**
 * Connected Users
 * Map<socketId, UserData>
 * 
 * UserData structure:
 * {
 *   socketId: string,     // Socket.io connection ID
 *   deviceId: string,     // Persistent device fingerprint
 *   nickname: string,     // Display name
 *   bio: string,          // Optional user bio
 *   gender: string,       // 'male', 'female', or 'unspecified'
 *   createdAt: Date       // When user connected
 * }
 */
const connectedUsers = new Map();

// ============================================================================
// MAIN HANDLER
// ============================================================================

/**
 * Next.js API Route Handler for Socket.io
 * 
 * This handler initializes the Socket.io server on first request.
 * Subsequent requests detect the existing server and skip initialization.
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 */
export default async function handler(req, res) {
  // Prevent duplicate server initialization
  // Socket.io server is attached to res.socket.server.io
  if (res.socket.server.io) {
    console.log('Socket server already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');

  // Create Socket.io server attached to the HTTP server
  const io = new Server(res.socket.server, {
    pingInterval: 10000,   // Send ping every 10 seconds
    pingTimeout: 5000,     // Wait 5 seconds for pong before disconnect
    cors: {
      origin: "*",         // Allow all origins (configure for production)
      methods: ["GET", "POST"],
    },
  });

  // Store reference to prevent re-initialization
  res.socket.server.io = io;

  // ============================================================================
  // MIDDLEWARE - Heartbeat
  // ============================================================================
  // Sends periodic heartbeat to keep connections alive
  io.use((socket, next) => {
    setInterval(() => {
      socket.emit("heartbeat", "alive");
    }, 5000);
    next();
  });

  // ============================================================================
  // CONNECTION HANDLER
  // ============================================================================
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // ========================================================================
    // AUTHENTICATION EVENTS
    // ========================================================================
    
    /**
     * Register User
     * 
     * Validates and stores user data, preventing duplicate nicknames.
     * Cleans up old sessions from the same device (duplicate prevention).
     * 
     * Input: { deviceId, nickname, bio?, gender? }
     * Output: { success, data? | error? }
     */
    socket.on("auth:register", (data) => {
      const { deviceId, nickname, bio, gender } = data;

      // Validate required fields
      if (!deviceId || !nickname) {
        return socket.emit("auth:register", { 
          success: false, 
          error: "Device ID and nickname are required" 
        });
      }

      // Check for duplicate nicknames (allow same device to re-register)
      const existingUser = Array.from(connectedUsers.values()).find(
        (u) => u.nickname.toLowerCase() === nickname.toLowerCase() && 
               u.socketId !== socket.id && 
               u.deviceId !== deviceId
      );

      if (existingUser) {
        return socket.emit("auth:register", { 
          success: false, 
          error: "This nickname is already in use" 
        });
      }

      // Clean up old sessions from the same deviceId
      // This prevents duplicate connections from the same device
      for (const [socketId, user] of connectedUsers.entries()) {
        if (user.deviceId === deviceId && socketId !== socket.id) {
          connectedUsers.delete(socketId);
        }
      }

      // Create user data object
      const userData = {
        socketId: socket.id,
        deviceId,
        nickname,
        bio: bio || "",
        gender: gender || "unspecified",
        createdAt: new Date(),
      };

      // Store user in connected users map
      connectedUsers.set(socket.id, userData);
      // Also attach to socket for easy access
      socket.data.user = userData;

      // Send success response
      socket.emit("auth:register", { 
        success: true, 
        data: userData 
      });
    });

    /**
     * Check Authentication Status
     * 
     * Returns whether the current socket is authenticated.
     * Output: { authenticated: boolean, data: UserData | null }
     */
    socket.on("auth:check", () => {
      const user = connectedUsers.get(socket.id);
      socket.emit("auth:check", { 
        authenticated: !!user, 
        data: user || null 
      });
    });

    /**
     * Logout User
     * 
     * Removes user from queue and connected users.
     * Output: { success: true }
     */
    socket.on("auth:logout", () => {
      removeFromQueue(socket.id);
      connectedUsers.delete(socket.id);
      socket.data.user = null;
      socket.emit("auth:logout", { success: true });
    });

    // ========================================================================
    // MATCHING QUEUE EVENTS
    // ========================================================================

    /**
     * Join Matching Queue
     * 
     * Adds user to the appropriate queue based on gender preference.
     * Immediately attempts to find a match.
     * 
     * Input: { preferredGender: 'any' | 'male' | 'female' }
     * Output: { success, queueType, position } | { success: false, error }
     */
    socket.on("queue:join", (data) => {
      const user = connectedUsers.get(socket.id);
      
      // User must be registered first
      if (!user) {
        return socket.emit("queue:join", { 
          success: false, 
          error: "Please register first" 
        });
      }

      // Default to 'any' if no preference specified
      const { preferredGender } = data || {};
      const queueType = preferredGender || "any";

      // Remove from any existing queue (prevent duplicates)
      removeFromQueue(socket.id);

      // Create queue entry with metadata
      const queueEntry = {
        socketId: socket.id,
        user,
        preferredGender: queueType,
        joinedAt: new Date(),
      };

      // Add to the appropriate queue
      matchingQueue[queueType].push(queueEntry);
      socket.data.inQueue = queueType;

      // Notify user of queue position
      socket.emit("queue:join", { 
        success: true, 
        queueType,
        position: matchingQueue[queueType].length 
      });

      // Attempt to find a match immediately
      tryMatch(socket, queueType, io);
    });

    /**
     * Leave Matching Queue
     * 
     * Removes user from their current queue.
     * Output: { success: true }
     */
    socket.on("queue:leave", () => {
      removeFromQueue(socket.id);
      socket.data.inQueue = null;
      socket.emit("queue:leave", { success: true });
    });

    /**
     * Get Queue Status
     * 
     * Returns user's current position in queue.
     * Output: { inQueue, queueType?, position?, totalInQueue? }
     */
    socket.on("queue:status", () => {
      const queueType = socket.data.inQueue;
      if (!queueType) {
        return socket.emit("queue:status", { inQueue: false });
      }

      // Find position in queue (0-indexed, so add 1)
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

    // ========================================================================
    // CHAT EVENTS
    // ========================================================================

    /**
     * Send Chat Message
     * 
     * Sends a message to both participants in the session.
     * 
     * Input: { message: string }
     * Output (to both): { id, sender, content, timestamp, isOwn }
     */
    socket.on("chat:send", (data) => {
      // Find the user's active session
      const session = getSessionBySocket(socket.id);
      
      if (!session) {
        return socket.emit("chat:send", { 
          success: false, 
          error: "Not in an active chat" 
        });
      }

      const user = connectedUsers.get(socket.id);
      
      // Create message object with unique ID
      const message = {
        id: generateMessageId(),
        sender: user.nickname,
        content: data.message,
        timestamp: new Date(),
      };

      // Send to BOTH participants in the session
      session.participants.forEach((participantId) => {
        const participantSocket = io.sockets.sockets.get(participantId);
        if (participantSocket) {
          participantSocket.emit("chat:message", {
            ...message,
            isOwn: participantId === socket.id,  // Mark if sender
          });
        }
      });
    });

    /**
     * Typing Indicator
     * 
     * Notifies the chat partner that user is typing.
     * Does not emit back to sender.
     */
    socket.on("chat:typing", () => {
      const session = getSessionBySocket(socket.id);
      if (!session) return;

      const user = connectedUsers.get(socket.id);
      
      // Find the partner (the other participant)
      const partnerId = session.participants.find((p) => p !== socket.id);
      
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit("chat:typing", { nickname: user.nickname });
        }
      }
    });

    /**
     * Leave Chat / Request Next Match
     * 
     * Ends the current chat session and notifies partner.
     * Output (to self): { success: true }
     * Output (to partner): chat:partnerLeft
     */
    socket.on("chat:leave", () => {
      const session = getSessionBySocket(socket.id);
      
      if (!session) {
        return socket.emit("chat:leave", { success: true });
      }

      // Notify partner that user left
      const partnerId = session.participants.find((p) => p !== socket.id);
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        if (partnerSocket) {
          partnerSocket.emit("chat:partnerLeft", {
            message: "Stranger has left the chat",
          });
        }
      }

      // Remove session from active sessions
      activeSessions.delete(session.id);
      socket.emit("chat:leave", { success: true });
    });

    /**
     * Report User
     * 
     * Handles user reports for inappropriate behavior.
     * In production, this would store reports in a database.
     * 
     * Input: { reason: string }
     * Output: { success: true, message }
     */
    socket.on("chat:report", (data) => {
      const session = getSessionBySocket(socket.id);
      const { reason } = data;

      // TODO: In production, store report in database with:
      // - Reporter's deviceId
      // - Reported user's deviceId
      // - Session ID
      // - Reason
      // - Timestamp
      console.log(`Report from ${socket.id}: ${reason}`);

      socket.emit("chat:report", { 
        success: true, 
        message: "Report submitted" 
      });
    });

    // ========================================================================
    // PLATFORM STATISTICS
    // ========================================================================

    /**
     * Get Platform Stats
     * 
     * Returns counts of users online, in queue, and in active chats.
     * Used for displaying live statistics on the landing page.
     * 
     * Output: { online, inQueue, inChat }
     */
    socket.on("platform:stats", () => {
      // Total connected users
      const totalOnline = connectedUsers.size;
      
      // Total users in all queues combined
      const inQueue = Object.values(matchingQueue).reduce(
        (sum, q) => sum + q.length, 0
      );
      
      // Users in active chats (2 users per session)
      const inChat = activeSessions.size * 2;

      socket.emit("platform:stats", {
        online: totalOnline,
        inQueue,
        inChat,
      });
    });

    // ========================================================================
    // DISCONNECT HANDLER
    // ========================================================================

    /**
     * Handle Client Disconnect
     * 
     * Cleans up all user state when they disconnect:
     * 1. Notifies chat partner if in active chat
     * 2. Removes session from active sessions
     * 3. Removes from matching queue
     * 4. Removes from connected users
     */
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Handle active chat session cleanup
      const session = getSessionBySocket(socket.id);
      if (session) {
        // Notify partner that user disconnected
        const partnerId = session.participants.find((p) => p !== socket.id);
        if (partnerId) {
          const partnerSocket = io.sockets.sockets.get(partnerId);
          if (partnerSocket) {
            partnerSocket.emit("chat:partnerLeft", {
              message: "Stranger has disconnected",
            });
          }
        }
        // Remove the session
        activeSessions.delete(session.id);
      }

      // Remove from any matching queue
      removeFromQueue(socket.id);
      
      // Remove from connected users
      connectedUsers.delete(socket.id);
    });
  });

  res.end();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Removes a user from all matching queues.
 * 
 * Called when user:
 * - Leaves queue manually
 * - Gets matched
 * - Disconnects
 * - Logs out
 * 
 * @param {string} socketId - The socket ID to remove
 */
function removeFromQueue(socketId) {
  Object.keys(matchingQueue).forEach((queueType) => {
    matchingQueue[queueType] = matchingQueue[queueType].filter(
      (e) => e.socketId !== socketId
    );
  });
}

/**
 * Attempts to find a match for a user who just joined the queue.
 * 
 * MATCHING ALGORITHM:
 * 
 * 1. User preference = "any":
 *    - Can match with ANYONE in ANY queue
 *    - Searches: any + male + female queues
 * 
 * 2. User preference = "male" or "female":
 *    - Matches with users who have the correct gender
 *    - Searches: any queue + specific gender queue
 *    - The matched user must have the gender the searcher wants
 * 
 * When match is found:
 * 1. Both users removed from queues
 * 2. New session created
 * 3. Both users notified via "match:found" event
 * 
 * @param {Socket} socket - The socket of the user looking for a match
 * @param {string} queueType - The queue type ('any', 'male', 'female')
 * @param {Server} io - The Socket.io server instance
 */
function tryMatch(socket, queueType, io) {
  const user = connectedUsers.get(socket.id);
  if (!user) return;

  let potentialMatches = [];

  if (queueType === "any") {
    // User wants anyone - match with anyone in any queue
    // Combine all queues and exclude self
    potentialMatches = [
      ...matchingQueue.any,
      ...matchingQueue.male,
      ...matchingQueue.female,
    ].filter((e) => e.socketId !== socket.id);
  } else {
    // User wants specific gender
    // Match with users looking for "any" OR their specific gender queue
    // The match must have the gender that the user wants
    const targetGender = user.gender;
    potentialMatches = [
      ...matchingQueue.any,
      ...matchingQueue[targetGender] || [],
    ].filter((e) => e.socketId !== socket.id);
  }

  // No matches available - user stays in queue
  if (potentialMatches.length === 0) return;

  // Get the first available match (FIFO - first in, first out)
  const match = potentialMatches[0];

  // Remove both users from all queues
  removeFromQueue(socket.id);
  removeFromQueue(match.socketId);

  // Create a new chat session
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    id: sessionId,
    participants: [socket.id, match.socketId],
    startedAt: new Date(),
  };

  // Store the session
  activeSessions.set(sessionId, session);

  // Get the match's socket for notification
  const matchSocket = io.sockets.sockets.get(match.socketId);

  // Notify the current user of the match
  socket.emit("match:found", {
    sessionId,
    partner: {
      nickname: match.user.nickname,
      bio: match.user.bio,
    },
  });

  // Notify the matched user
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

/**
 * Finds the active chat session for a given socket.
 * 
 * Searches through all active sessions to find one
 * where the socket is a participant.
 * 
 * @param {string} socketId - The socket ID to search for
 * @returns {Object|null} The session object or null if not in a session
 */
function getSessionBySocket(socketId) {
  for (const [, session] of activeSessions) {
    if (session.participants.includes(socketId)) {
      return session;
    }
  }
  return null;
}

/**
 * Generates a unique message ID.
 * 
 * Format: msg_<timestamp>_<random>
 * Example: msg_1706978400000_a1b2c3d4e
 * 
 * @returns {string} Unique message identifier
 */
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
