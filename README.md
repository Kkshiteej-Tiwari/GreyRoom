# GreyRoom

**Anonymous Real-Time Chat Platform with AI-Powered Verification**

GreyRoom is a modern, privacy-first anonymous chat platform that connects strangers worldwide for real-time text conversations. Built with cutting-edge web technologies and browser-based machine learning, GreyRoom ensures genuine human connections while maintaining complete anonymity.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-green)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Core Functionality](#-core-functionality)
- [Privacy & Security](#-privacy--security)
- [Team](#-team)
- [Contributing](#-contributing)
- [License](#-license)

---

## Features

### Core Features
- **Real-Time Chat** - Instant text messaging using WebSocket technology
- **Complete Anonymity** - No registration, no personal information, no tracking
- **AI-Powered Verification** - Browser-based face detection ensures real human connections
- **Smart Matching Algorithm** - Connect with strangers based on preferences (Any/Male/Female)
- **Ephemeral Messaging** - Nothing is stored; conversations disappear after disconnect
- **Instant Matching** - Get paired with someone new in seconds
- **Privacy First** - All face verification happens locally in the browser

### User Experience
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile
- **Beautiful UI** - Modern, minimalist interface with smooth Framer Motion animations
- **Theme Support** - Light and dark theme options in chat
- **Freemium Model** - Unlimited "Anyone" matches + 5 daily gender-specific matches
- **Device Fingerprinting** - Persistent sessions without accounts
- **DiceBear Avatars** - Auto-generated unique avatars for each user

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with SSR & API routes |
| **React** | 19.0.0 | UI component library |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Framer Motion** | 12.4.7 | Animation library for smooth transitions |
| **@vladmandic/face-api** | 1.7.15 | Browser-based ML for face detection |
| **Headless UI** | 2.2.0 | Unstyled accessible UI components |
| **clsx** | 2.1.1 | Utility for constructing className strings |

### Backend & Real-Time
| Technology | Version | Purpose |
|------------|---------|---------|
| **Socket.io** | 4.8.1 | WebSocket server for real-time communication |
| **Socket.io Client** | 4.8.1 | WebSocket client library |
| **Next.js API Routes** | - | Serverless API endpoints |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.20.1 | Code linting and formatting |
| **PostCSS** | 8.5.2 | CSS processing |
| **Autoprefixer** | 10.4.20 | CSS vendor prefixes |

---

## Architecture

### System Overview

```
+-------------------------------------------------------------------+
|                        CLIENT (Browser)                           |
|  +----------------+  +----------------+  +----------------+       |
|  |    Next.js     |  |  face-api.js   |  |   Socket.io    |       |
|  |    Frontend    |  |  (ML Local)    |  |     Client     |       |
|  +----------------+  +----------------+  +--------+-------+       |
+----------------------------------------------------|---------------+
                                                     |
                                              WebSocket
                                                     |
+----------------------------------------------------|--------------+
|                        SERVER                      v              |
|  +-----------------------------------------------------------+   |
|  |              Next.js API Routes + Socket.io               |   |
|  +-----------------------------------------------------------+   |
|                                                                   |
|  +----------------+  +----------------+  +----------------+       |
|  |   Connected    |  |    Matching    |  |    Active      |       |
|  |     Users      |  |     Queues     |  |   Sessions     |       |
|  |     (Map)      |  |   (any/m/f)    |  |     (Map)      |       |
|  +----------------+  +----------------+  +----------------+       |
+-------------------------------------------------------------------+
```

### Key Components

#### 1. Device ID System
- **Purpose**: Identify users without login credentials
- **Storage**: Browser localStorage
- **Format**: `gr_<timestamp>_<random>`
- **Use Cases**: Session persistence, duplicate prevention, freemium limits

#### 2. Face Verification (Delete-After-Verify)
- **Process**: Capture → ML Inference → Store Classification
- **Privacy**: Images never leave the browser, never stored
- **Models**: TinyFaceDetector + AgeGenderNet from face-api.js
- **Output**: Gender classification + confidence score only

#### 3. Matching Algorithm
```javascript
User Preference = "any"     → Search all queues
User Preference = "male"    → Search any + male queues
User Preference = "female"  → Search any + female queues
```

#### 4. Socket Events
- **Authentication**: `auth:register`, `auth:check`, `auth:logout`
- **Queue**: `queue:join`, `queue:leave`, `queue:status`
- **Matching**: `match:found`
- **Chat**: `chat:send`, `chat:message`, `chat:typing`, `chat:leave`
- **Platform**: `platform:stats`

---

## Getting Started

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Browser**: Modern browser with camera support (Chrome, Firefox, Safari, Edge)
- **Webcam**: Required for face verification feature

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kkshiteej-Tiwari/GreyRoom.git
   cd GreyRoom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   Navigate to http://localhost:3000
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

---

## Usage

### User Flow

#### 1. Landing Page
- View features, benefits, and platform statistics
- Click "Try Out" or "Get Started" to begin

#### 2. Profile Setup
- Enter nickname (anonymous identifier)
- Optionally add a short bio
- Choose to verify identity using face detection

#### 3. Face Verification (Optional but Recommended)
- Grant camera permissions
- Position face clearly in frame
- AI verifies you're a real person (not a bot)
- Gender is detected locally (never stored on server)
- Image is deleted immediately after classification

#### 4. Matching
- Choose preference: Anyone, Male, or Female
- Click "Start Matching"
- Wait for a match (usually seconds)
- Free users get unlimited "Anyone" matches
- Gender-specific matches limited to 5 per day

#### 5. Chat
- Real-time text chat with stranger
- See typing indicators when partner is typing
- Options available:
  - Continue chatting
  - Skip to next match (click "Next")
  - Report inappropriate behavior
  - Leave conversation

#### 6. Next Match
- Previous conversation is completely deleted
- Start fresh with a new stranger
- No chat history is ever stored

---

## Configuration

The application can be configured via `src/config/config.js`:

```javascript
export const appConfig = {
  // Branding
  name: "Greyroom",
  tagline: "Controlled Anonymity",
  
  // Avatar Generation (DiceBear API)
  avatarAPI: "https://api.dicebear.com/7.x/avataaars/svg?seed=",
  
  // Chat Settings
  maxMessageLength: 1000,        // Max characters per message
  
  // Matching Settings
  matchCooldownMs: 3000,         // 3 second cooldown between matches
  maxDailyMatches: 5,            // Daily limit for gender-specific matches
  
  // LocalStorage Keys
  deviceIdKey: "greyroom_device_id",
  userDataKey: "greyroom_user_data",
  matchCountKey: "greyroom_match_count",
  lastResetKey: "greyroom_last_reset",
};
```

---

## Project Structure

```
GreyRoom/
├── public/
│   ├── models/              # face-api.js ML models (CDN fallback)
│   └── logo.jpeg            # Application logo
├── src/
│   ├── components/
│   │   ├── landing/         # Landing page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── PillButton.jsx
│   │   │   ├── GlassCard.jsx
│   │   │   ├── FloatingTag.jsx
│   │   │   ├── HighlightText.jsx
│   │   │   ├── MobileCard.jsx
│   │   │   └── TickerBar.jsx
│   │   └── MiniGames.jsx    # (Future feature)
│   ├── config/
│   │   └── config.js        # App configuration
│   ├── context/
│   │   └── SocketContext.js # Socket.io state management
│   ├── modules/
│   │   └── verification/
│   │       ├── index.js
│   │       ├── components/
│   │       │   ├── CameraCapture.jsx
│   │       │   ├── VerificationFlow.jsx
│   │       │   └── VerificationResult.jsx
│   │       └── utils/
│   │           ├── faceDetection.js      # ML inference
│   │           └── verificationStorage.js # Result storage
│   ├── pages/
│   │   ├── _app.jsx         # App wrapper
│   │   ├── index.jsx        # Landing + setup page
│   │   ├── match.jsx        # Matching queue page
│   │   ├── verify.jsx       # Verification page
│   │   ├── api/
│   │   │   └── socket.js    # Socket.io server
│   │   └── chat/
│   │       └── [sessionId].jsx # Chat room
│   ├── styles/
│   │   └── globals.css      # Global styles + Tailwind
│   └── utils/
│       └── deviceId.js      # Device fingerprinting
├── DOCUMENTATION.md         # Technical documentation
├── README.md                # This file
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── jsconfig.json            # JavaScript path aliases
└── package.json             # Dependencies & scripts
```

---

## Core Functionality

### 1. Device Fingerprinting (`src/utils/deviceId.js`)
```javascript
// Generates unique identifier stored in localStorage
const deviceId = generateDeviceId(); 
// Format: gr_<timestamp_base36>_<random_string>
// Example: gr_m0x5k2p_8f3h2k9m1n4p7q2w5e8r

// Used for:
// - Session persistence across page refreshes
// - Preventing duplicate WebSocket connections
// - Tracking daily match limits (freemium model)
// - Associating user data without login
```

### 2. Face Detection - Delete After Verify (`src/modules/verification/`)
```javascript
// All processing happens in browser - NOTHING sent to server
const detection = await detectGender(videoElement);

// Returns ONLY classification (image is deleted immediately):
{
  gender: 'male',      // or 'female'
  confidence: 95,      // percentage
  age: 25              // estimated age
}

// Privacy Guarantees:
// - Images never leave the browser
// - No face embeddings stored
// - No biometric data collected
// - Only classification result saved to localStorage
```

### 3. WebSocket Communication (`src/context/SocketContext.js`)
```javascript
// Singleton socket connection persists across page navigations
// Client connects and registers
socket.emit('auth:register', {
  deviceId: 'gr_...',
  nickname: 'CoolUser',
  gender: 'male'
});

// Join matching queue with preference
socket.emit('queue:join', {
  preferredGender: 'any' // or 'male', 'female'
});

// Receive match notification
socket.on('match:found', ({ sessionId, partner }) => {
  // Redirect to chat room
  router.push(`/chat/${sessionId}`);
});

// Real-time messaging
socket.emit('chat:send', { message: 'Hello!' });
socket.on('chat:message', (message) => { /* display */ });
```

### 4. Matching Algorithm (`src/pages/api/socket.js`)
```
Queue Structure:
- matchingQueue.any[]     - Users who want to chat with anyone
- matchingQueue.male[]    - Users who want to chat with males
- matchingQueue.female[]  - Users who want to chat with females

Matching Logic:
- User preference = "any"    -> Search ALL queues
- User preference = "male"   -> Search any + male queues  
- User preference = "female" -> Search any + female queues

Algorithm: First-come-first-served within compatible queues
```

### 5. Freemium Model
| Feature | Free Tier |
|---------|-----------|
| "Anyone" matches | Unlimited |
| Gender-specific matches | 5 per day |
| Reset time | Daily at midnight (client timezone) |
| Storage | localStorage with timestamp check |

---

## Socket Events Reference

### Authentication Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `auth:register` | Client → Server | `{deviceId, nickname, bio, gender}` | Register user session |
| `auth:register` | Server → Client | `{success, data/error}` | Registration result |
| `auth:check` | Client → Server | - | Check authentication status |
| `auth:logout` | Client → Server | - | End user session |

### Queue Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `queue:join` | Client → Server | `{preferredGender}` | Join matching queue |
| `queue:leave` | Client → Server | - | Leave matching queue |
| `queue:status` | Client → Server | - | Get queue position |
| `match:found` | Server → Client | `{sessionId, partner}` | Match notification |

### Chat Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `chat:send` | Client → Server | `{message}` | Send message |
| `chat:message` | Server → Client | `{id, sender, content, timestamp, isOwn}` | Receive message |
| `chat:typing` | Client → Server | - | Typing indicator |
| `chat:typing` | Server → Client | `{nickname}` | Partner typing |
| `chat:leave` | Client → Server | - | Leave chat |
| `chat:partnerLeft` | Server → Client | `{message}` | Partner disconnected |
| `chat:report` | Client → Server | `{reason}` | Report user |

### Platform Events
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `platform:stats` | Client → Server | - | Request stats |
| `platform:stats` | Server → Client | `{online, inQueue, inChat}` | Platform statistics |

---

## Privacy & Security

### Data Collection
**What we DON'T collect:**
- ❌ No personal information
- ❌ No email addresses
- ❌ No phone numbers
- ❌ No login credentials
- ❌ No chat logs
- ❌ No images or videos
- ❌ No IP addresses
- ❌ No cookies (except essential)

**What we DO store (locally only):**
- ✅ Device ID (localStorage)
- ✅ Gender classification result (localStorage)
- ✅ Daily match count (localStorage)
- ✅ User preferences (localStorage)

### Security Features
1. **No Server-Side Storage**: All sensitive data stays in the browser
2. **Ephemeral Sessions**: Conversations are deleted on disconnect
3. **Local ML Processing**: Face detection runs entirely in browser
4. **WebSocket Security**: Real-time communication over encrypted connections
5. **CORS Protection**: API routes protected with CORS policies

### Face Verification Privacy
```
Camera → Browser Memory → ML Model → Classification → localStorage
  ↓
Deleted immediately (never sent to server)
```

---

## Team

This project was developed by:

| Name | Role |
|------|------|
| **Kkshiteej Tiwari** | Lead Developer - Project architecture, Socket.io implementation, ML integration |
| **Kalpit** | Developer - UI/UX design, frontend components, animations |
| **Ridwan Umar** | Developer - Matching algorithm, verification system, documentation |

---

## Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
1. **Report bugs** - Open an issue with detailed reproduction steps
2. **Suggest features** - Share your ideas for improvements
3. **Improve documentation** - Help others understand the project
4. **Submit pull requests** - Fix bugs or add features

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow existing code style (ESLint rules)
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **@vladmandic/face-api** - Browser-based ML models for face detection
- **Socket.io** - Real-time bidirectional event-based communication
- **Next.js** - The React framework for production
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready animation library
- **DiceBear** - Avatar generation API
- **Heroicons** - SVG icon library

---

## Roadmap

### Planned Features
- [ ] Video chat integration (WebRTC)
- [ ] End-to-end encryption for messages
- [ ] Interest-based matching tags
- [ ] Language preference filters
- [ ] Report system with AI moderation
- [ ] Premium tier with unlimited matches
- [ ] Mobile app (React Native)

---

## Links

- **Repository**: [https://github.com/Kkshiteej-Tiwari/GreyRoom](https://github.com/Kkshiteej-Tiwari/GreyRoom)
- **Technical Documentation**: [DOCUMENTATION.md](DOCUMENTATION.md)

---

<div align="center">

**Built by Kkshiteej Tiwari, Kalpit, and Ridwan Umar**

</div>
