# Intervals

**Intervals** is a modern, production-ready focus timer and productivity tracking application built with React Native and Expo. Designed to help you manage your time effectively, it combines flexible interval tracking with project-based organization and insightful analytics.

## ✨ Features

- **⏱️ Smart Focus Timer**: Customizable work intervals with intuitive controls (start, pause, resume, reset).
- **📂 Project Management**: Organize your sessions into custom projects or categories (e.g., Work, Learning, Creative).
- **📊 History & Insights**: Comprehensive session logs and visual statistics to track your productivity over time.
- **🎨 Modern UI/UX**: Clean, distraction-free interface with haptic feedback and smooth animations.
- **⚙️ Fully Customizable**: Adjust interval durations, sound preferences, and notifications to suit your workflow.
- **💾 Offline-First**: All data is securely persisted locally, ensuring your data is always available.

## 🛠️ Tech Stack

Built with a focus on performance, scalability, and developer experience:

- **Framework**: [React Native](https://reactnative.dev/) (v0.81) via [Expo](https://expo.dev/) (SDK 54)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (v6)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistence
- **Styling**: Native StyleSheet & Expo Vector Icons
- **Tooling**: [Biome](https://biomejs.dev/) for fast linting and formatting
- **Utilities**: [date-fns](https://date-fns.org/) for robust date handling

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (Latest LTS recommended)
- **npm** or **pnpm** or **yarn**
- **Expo Go** app on your mobile device (or an Android/iOS Simulator)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd intervals
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the App

Start the development server:

```bash
npm start
```

- **Scan the QR code** with the Expo Go app (Android) or Camera app (iOS).
- Press `a` to run on **Android Emulator**.
- Press `i` to run on **iOS Simulator**.
- Press `w` to run on **Web**.

## 📁 Project Structure

```
intervals/
├── src/
│   ├── app/           # Expo Router pages and layouts
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # Service layer (e.g., storage)
│   ├── store/         # Zustand state modules
│   ├── theme/         # Design tokens (colors, typography)
│   └── utils/         # Helper functions
├── assets/            # Static assets (images, fonts)
├── .vscode/           # VS Code configuration
├── biome.json         # Biome configuration
└── package.json       # Project dependencies and scripts
```

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Start the Expo development server |
| `npm run android` | Build and run on Android emulator/device |
| `npm run ios` | Build and run on iOS simulator/device |
| `npm run lint` | Check for code quality issues using Biome |
| `npm run format` | Auto-format code using Biome |
| `npm run typecheck` | Run TypeScript compiler validation |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
