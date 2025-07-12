# Accountrix - Privacy-First Account Session Manager

<div align="center">
  <h3>🔒 Take Control of Your Digital Identity</h3>
  <p>A modern, privacy-first mobile app that helps you view, manage, and clean up all websites, apps, and devices where your Google, Microsoft, and Apple ID accounts are currently logged in.</p>
</div>

## 🌟 Features

### 🆓 Free Plan
- **View Google Sessions** - See all active Google account sessions
- **View Microsoft Sessions** - Monitor Microsoft account activity
- **Basic Export** - Export session data in CSV or JSON format
- **Session Health Score** - Get an overall security score for your sessions
- **Basic Cleanup Tips** - Receive simple security recommendations

### 💎 Lite Plan ($3.99/month)
- **Everything in Free Plan**
- **One-Click Logout** - Instantly logout from any session
- **Multi-Session Selection** - Select multiple sessions for bulk actions
- **Enhanced Export** - Additional export formats and detailed reports
- **Auto-Cleanup** - Automatically clean up inactive sessions

### 🚀 Full Plan ($6.99/month)
- **Everything in Lite Plan**
- **Apple ID Sessions** - Full Apple ID session management (iOS only)
- **Mass Logout** - Bulk logout operations across all providers
- **AI Security Suggestions** - Smart recommendations powered by AI
- **Full Risk Reports** - Comprehensive security analysis
- **Priority Support** - Direct support channel

## 🎨 Design Philosophy

### Apple x Notion-Inspired Design
- **Clean, spacious layouts** with grid-based structure
- **Smooth animations** with 200-400ms timing
- **Circular provider buttons** with brand-specific colors
- **Card-style interfaces** with soft shadows and rounded corners
- **Full dark mode support** with automatic theme detection

### Color Palette
- **Background**: Light (#F9FAFB) / Dark (#1C1C1E)
- **Google**: #4285F4 (Google Blue)
- **Microsoft**: #5E5E5E (Multi-color squares)
- **Apple**: #000000 (Black)
- **Premium**: Purple (#8B5CF6) to Gold (#FFD700) gradient

## 🔐 Privacy & Security

### Local-First Architecture
- **All data stored locally** in `Android/data/com.accountrix.app/users/data/`
- **No cloud sync** - your data never leaves your device
- **Encrypted storage** with device-specific encryption keys
- **Zero tracking** - no analytics or telemetry

### Security Features
- **Session health scoring** with risk assessment
- **Location-based anomaly detection**
- **Inactive session identification**
- **Security recommendations** based on usage patterns

## 📱 Technical Stack

### Frontend
- **React Native** with Expo for cross-platform development
- **React Navigation** for seamless screen transitions
- **React Native Paper** for Material Design components
- **Reanimated 3** for smooth animations
- **Linear Gradient** for beautiful UI effects

### Authentication
- **OAuth 2.0** for secure provider authentication
- **Google OAuth** for Google account integration
- **Microsoft Graph API** for Microsoft account data
- **Apple Sign-In** for Apple ID sessions (iOS only)

### Data Management
- **Expo SecureStore** for encrypted token storage
- **React Native Encrypted Storage** for sensitive data
- **Expo FileSystem** for local file operations
- **AsyncStorage** for app preferences

### Monetization
- **Expo In-App Purchases** for subscription management
- **RevenueCat** integration for advanced subscription features
- **Freemium model** with three tiers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React Native development environment
- iOS Simulator (for iOS development)
- Android emulator or device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/accountrix.git
   cd accountrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OAuth credentials**
   - Create OAuth applications for Google, Microsoft, and Apple
   - Update the client IDs in `src/context/AuthContext.js`

4. **Run the app**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Environment Setup

Create a `.env` file in the root directory:
```env
GOOGLE_CLIENT_ID=your_google_client_id
MICROSOFT_CLIENT_ID=your_microsoft_client_id
APPLE_CLIENT_ID=your_apple_client_id
```

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
│   ├── OnboardingScreen.js
│   ├── HomeScreen.js
│   ├── DetailsScreen.js
│   ├── PremiumScreen.js
│   ├── SettingsScreen.js
│   └── AuthScreen.js
├── context/            # React Context providers
│   ├── AuthContext.js
│   ├── ThemeContext.js
│   └── PremiumContext.js
├── services/           # API and utility services
│   ├── LocalStorageService.js
│   └── SessionService.js
└── theme.js           # Design system configuration
```

### Key Components

#### AuthContext
- Manages OAuth authentication flows
- Handles token storage and refresh
- Provides session data across the app

#### LocalStorageService
- Encrypts and stores user data locally
- Manages the `Android/data/com.accountrix.app/users/data/` directory
- Handles data export and import

#### SessionService
- Integrates with Google, Microsoft, and Apple APIs
- Normalizes session data across providers
- Calculates security scores and recommendations

## 🔌 API Integration

### Google OAuth 2.0
```javascript
// Google session management
const googleSessions = await SessionService.getGoogleSessions(accessToken);
await SessionService.revokeGoogleSession(accessToken, sessionId);
```

### Microsoft Graph API
```javascript
// Microsoft session management
const microsoftSessions = await SessionService.getMicrosoftSessions(accessToken);
await SessionService.revokeMicrosoftSession(accessToken, sessionId);
```

### Apple Sign-In
```javascript
// Apple ID session management (iOS only)
const appleSessions = await SessionService.getAppleSessions(accessToken);
await SessionService.revokeAppleSession(accessToken, sessionId);
```

## 📱 Deployment

### Android (APK)
```bash
# Build APK for testing
npm run build:android

# The APK will be generated in:
# android/app/build/outputs/apk/release/app-release.apk
```

### iOS (TestFlight)
```bash
# Build for iOS
npm run build:ios

# Follow Expo/EAS build process for TestFlight distribution
```

### Web (PWA)
```bash
# Build web version
npm run build:web

# Deploy to any static hosting service
```

## 🎯 Core Features Implementation

### Session Management
- **Real-time session monitoring** with auto-refresh
- **Smart categorization** (Devices, Apps, Websites)
- **Risk-based scoring** for security assessment
- **Bulk operations** for premium users

### Premium Features
- **Feature gating** with smooth upgrade flows
- **Subscription management** with auto-renewal
- **Restore purchases** functionality
- **Graceful degradation** for free users

### UI/UX Enhancements
- **Smooth animations** with React Native Reanimated
- **Haptic feedback** for user interactions
- **Confetti celebrations** for successful actions
- **Toast notifications** for user feedback

## 🔧 Configuration

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API and People API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `com.accountrix.app://oauth/google`

#### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Configure redirect URI: `com.accountrix.app://oauth/microsoft`
4. Add required permissions for Microsoft Graph

#### Apple Sign-In
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Configure Sign in with Apple
3. Set up App ID and Service ID
4. Configure redirect URI: `com.accountrix.app://oauth/apple`

## 🛠️ Development

### Code Style
- **ESLint** configuration for consistent code style
- **Prettier** for automatic code formatting
- **TypeScript** support for type safety
- **Modular architecture** with clear separation of concerns

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Debugging
- **React Native Debugger** for development
- **Flipper** integration for network inspection
- **Error boundaries** for graceful error handling

## 🔐 Security Considerations

### Data Protection
- **End-to-end encryption** for sensitive data
- **Secure token storage** with Keychain/Keystore
- **Certificate pinning** for API communications
- **Biometric authentication** for app access

### Privacy Compliance
- **GDPR compliance** with local data storage
- **No personal data collection** beyond OAuth tokens
- **Transparent privacy policy** with clear data usage
- **User control** over all stored data

## 📊 Analytics & Monitoring

### Privacy-First Analytics
- **No third-party trackers** or analytics
- **Local usage statistics** only
- **Crash reporting** without personal data
- **Performance monitoring** for app optimization

## 🚀 Future Enhancements

### Planned Features
- **2FA session management**
- **Password manager integration**
- **Enterprise account support**
- **Advanced threat detection**
- **Custom security policies**

### Platform Extensions
- **macOS companion app**
- **Browser extension**
- **Apple Watch support**
- **Siri Shortcuts integration**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📞 Support

- **Email**: support@accountrix.app
- **Documentation**: [docs.accountrix.app](https://docs.accountrix.app)
- **Community**: [GitHub Discussions](https://github.com/yourusername/accountrix/discussions)

## 🙏 Acknowledgments

- **OAuth providers** for secure authentication APIs
- **React Native community** for excellent tooling
- **Expo team** for streamlined development
- **Open source contributors** who made this possible

---

<div align="center">
  <p>Built with ❤️ for digital privacy and security</p>
  <p>© 2024 Accountrix. All rights reserved.</p>
</div>