# GreyRoom - Technical Documentation

## Project Overview
GreyRoom is an anonymous real-time chat platform that matches users for text conversations. Built with Next.js, Socket.io, and browser-based ML for gender verification.

---

## 1. "Delete-After-Verify" Logic

### Concept
The verification system uses **on-device machine learning** to classify user gender without storing any images or biometric data on servers. This "delete-after-verify" approach ensures maximum privacy.

### Implementation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DELETE-AFTER-VERIFY FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │   CAPTURE    │ ──► │   PROCESS    │ ──► │    STORE     │
    │   (Camera)   │     │  (In-Memory) │     │(Result Only) │
    └──────────────┘     └──────────────┘     └──────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │ Video frame  │     │ ML inference │     │ Gender: male │
    │ from webcam  │     │ face-api.js  │     │ Confidence   │
    │              │     │ TinyFaceNet  │     │ Timestamp    │
    └──────────────┘     └──────────────┘     └──────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
    ┌──────────────────────────────────────────────────────────┐
    │              ❌ IMAGE IS NEVER STORED                    │
    │              ❌ NO SERVER TRANSMISSION                   │
    │              ✅ ONLY CLASSIFICATION RESULT SAVED         │
    └──────────────────────────────────────────────────────────┘
```

### Technical Details

**File: `src/modules/verification/utils/faceDetection.js`**

```javascript
// All ML processing happens in browser memory
export async function detectGender(input) {
  // Uses TinyFaceDetector for lightweight detection
  const detection = await faceapi
    .detectSingleFace(input, new TinyFaceDetectorOptions())
    .withAgeAndGender();
  
  // Returns ONLY classification result, not the image
  return {
    gender: detection.gender,        // 'male' or 'female'
    confidence: detection.genderProbability * 100,
    age: Math.round(detection.age)
  };
}
```

**File: `src/modules/verification/utils/verificationStorage.js`**

```javascript
// ONLY stores classification result - NEVER the image
export function storeVerificationResult(result, deviceId) {
  const verificationData = {
    gender: result.gender,           // ✅ Classification only
    confidence: result.confidence,   // ✅ Confidence score
    verifiedAt: new Date().toISOString(),
    deviceId: deviceId
    // ❌ NO image data stored
    // ❌ NO biometric data stored
  };
  
  localStorage.setItem(VERIFICATION_KEY, JSON.stringify(verificationData));
}
```

### Privacy Guarantees

| Data Type | Stored? | Where? |
|-----------|---------|--------|
| Video/Image | ❌ NO | Never saved |
| Face embeddings | ❌ NO | Discarded after inference |
| Gender classification | ✅ YES | localStorage only |
| Confidence score | ✅ YES | localStorage only |
| Timestamp | ✅ YES | localStorage only |

---

## 2. Device ID Implementation

### Purpose
Device ID enables user identification without requiring login credentials. It provides:
- Session persistence across page refreshes
- Duplicate connection prevention
- Freemium feature limiting (daily match counts)

### Implementation

**File: `src/utils/deviceId.js`**

```javascript
// Generate unique device fingerprint
export function generateDeviceId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `gr_${timestamp}_${randomPart}${randomPart2}`;
}

// Get or create persistent device ID
export function getDeviceId() {
  let deviceId = localStorage.getItem('greyroom_device_id');
  
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('greyroom_device_id', deviceId);
  }
  
  return deviceId;
}
```

### Device ID Format
```
gr_<timestamp_base36>_<random1><random2>

Example: gr_m0x5k2p_8f3h2k9m1n4p7q2w5e8r
         │  │        │
         │  │        └── Random string (26 chars)
         │  └── Timestamp in base36
         └── Prefix identifier
```

### Usage in Socket Connection

```javascript
// On socket connection, register with device ID
socket.emit("auth:register", {
  deviceId: getDeviceId(),
  nickname: "User123",
  gender: "male"
});

// Server validates and prevents duplicates
socket.on("auth:register", (data) => {
  // Clean up old sessions from same deviceId
  for (const [socketId, user] of connectedUsers.entries()) {
    if (user.deviceId === deviceId && socketId !== socket.id) {
      connectedUsers.delete(socketId);
    }
  }
});
```

---

## 3. Architecture Diagram - Queue + Socket Flow

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GREYROOM ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────┐
                              │   BROWSER     │
                              │   (Client)    │
                              └───────┬───────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
           │   Device ID  │  │ Verification │  │   Socket.io  │
           │   Manager    │  │  (ML Local)  │  │    Client    │
           └──────────────┘  └──────────────┘  └──────┬───────┘
                                                      │
                              WebSocket Connection    │
                    ══════════════════════════════════╪═══════════════
                                                      │
                                                      ▼
                              ┌────────────────────────────────────────┐
                              │           NEXT.JS SERVER               │
                              │        (pages/api/socket.js)           │
                              └────────────────────────────────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────────┐
                    │                           │                           │
                    ▼                           ▼                           ▼
           ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
           │  Connected   │            │   Matching   │            │   Active     │
           │    Users     │            │    Queues    │            │  Sessions    │
           │    (Map)     │            │   (Object)   │            │    (Map)     │
           └──────────────┘            └──────────────┘            └──────────────┘
```

### Matching Queue System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MATCHING QUEUE STRUCTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              matchingQueue = {
                                
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │   Queue: ANY    │       │  Queue: MALE    │       │  Queue: FEMALE  │
    ├─────────────────┤       ├─────────────────┤       ├─────────────────┤
    │ User A          │       │ User C          │       │ User E          │
    │ (wants anyone)  │       │ (wants male)    │       │ (wants female)  │
    ├─────────────────┤       ├─────────────────┤       ├─────────────────┤
    │ User B          │       │ User D          │       │ User F          │
    │ (wants anyone)  │       │ (wants male)    │       │ (wants female)  │
    └─────────────────┘       └─────────────────┘       └─────────────────┘

                              }
```

### Socket Event Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SOCKET EVENT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    CLIENT                                              SERVER
    ──────                                              ──────
       │                                                   │
       │  ══════ CONNECTION PHASE ══════                   │
       │                                                   │
       │  ─────── connect ────────────────────────────►    │
       │                                                   │
       │  ─────── auth:register ──────────────────────►    │
       │          {deviceId, nickname, gender}             │
       │                                                   │
       │  ◄─────── auth:register ─────────────────────     │
       │          {success: true, data: userData}          │
       │                                                   │
       │  ══════ MATCHING PHASE ══════                     │
       │                                                   │
       │  ─────── queue:join ─────────────────────────►    │
       │          {preferredGender: 'any'}                 │
       │                                                   │
       │  ◄─────── queue:join ────────────────────────     │
       │          {success, queueType, position}           │
       │                                                   │
       │         ┌──────────────────────────────────┐      │
       │         │ SERVER: tryMatch() algorithm     │      │
       │         │ - Check compatible queues        │      │
       │         │ - Find available partner         │      │
       │         │ - Create session                 │      │
       │         └──────────────────────────────────┘      │
       │                                                   │
       │  ◄─────── match:found ───────────────────────     │
       │          {sessionId, partner: {nickname, bio}}    │
       │                                                   │
       │  ══════ CHAT PHASE ══════                         │
       │                                                   │
       │  ─────── chat:send ──────────────────────────►    │
       │          {message: "Hello!"}                      │
       │                                                   │
       │  ◄─────── chat:message ──────────────────────     │
       │          {id, sender, content, timestamp}         │
       │                                                   │
       │  ─────── chat:leave ─────────────────────────►    │
       │                                                   │
       │  ◄─────── chat:leave ────────────────────────     │
       │          {success: true}                          │
       │                                                   │
```

### Match Algorithm Visualization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MATCHING ALGORITHM                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    User joins queue with preference
              │
              ▼
    ┌─────────────────────────────────┐
    │  User Preference = "any"?       │──── YES ───►  Search all queues
    └─────────────────────────────────┘               for first available
              │
              NO
              │
              ▼
    ┌─────────────────────────────────┐
    │  User Preference = "male"?      │──── YES ───►  Search: any + male queues
    └─────────────────────────────────┘               Match with males
              │
              NO
              │
              ▼
    ┌─────────────────────────────────┐
    │  User Preference = "female"?    │──── YES ───►  Search: any + female queues
    └─────────────────────────────────┘               Match with females


    ┌─────────────────────────────────────────────────────────────────┐
    │                     MATCH FOUND?                                │
    └─────────────────────────────────────────────────────────────────┘
              │                                    │
             YES                                   NO
              │                                    │
              ▼                                    ▼
    ┌─────────────────────┐              ┌─────────────────────┐
    │ 1. Remove both from │              │ Stay in queue       │
    │    queues           │              │ Wait for next user  │
    │ 2. Create session   │              └─────────────────────┘
    │ 3. Emit match:found │
    │    to both users    │
    └─────────────────────┘
```

### Data Structures

```javascript
// Connected Users Map
connectedUsers = Map {
  "socket_id_1" => {
    socketId: "socket_id_1",
    deviceId: "gr_m0x5k2p_8f3h2k9m...",
    nickname: "CoolUser",
    bio: "Hello world",
    gender: "male",
    createdAt: Date
  },
  "socket_id_2" => { ... }
}

// Matching Queues Object
matchingQueue = {
  any: [
    { socketId, user, preferredGender: "any", joinedAt }
  ],
  male: [
    { socketId, user, preferredGender: "male", joinedAt }
  ],
  female: [
    { socketId, user, preferredGender: "female", joinedAt }
  ]
}

// Active Sessions Map
activeSessions = Map {
  "session_123_abc" => {
    id: "session_123_abc",
    participants: ["socket_id_1", "socket_id_2"],
    startedAt: Date
  }
}
```

---

## 4. Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16.1.6, React 19.0.0 |
| Styling | Tailwind CSS 3.4.17 |
| Real-time | Socket.io 4.8.1 |
| ML/AI | @vladmandic/face-api 1.7.15 |
| Animations | Framer Motion 12.4.7 |
| State | React Context API |
| UI Components | Headless UI 2.2.0 |

---

## 5. Key Files Reference

| File | Purpose |
|------|---------|
| `src/pages/api/socket.js` | WebSocket server, matching logic |
| `src/utils/deviceId.js` | Device fingerprinting |
| `src/modules/verification/utils/faceDetection.js` | ML gender detection |
| `src/modules/verification/utils/verificationStorage.js` | Result storage |
| `src/context/SocketContext.js` | Socket state management |

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Project:** GreyRoom - Anonymous Real-Time Chat Platform
