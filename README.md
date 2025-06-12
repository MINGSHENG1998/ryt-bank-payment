## Setup Instructions

Follow these steps to set up the project locally:

1. **Clone the Repository**:
   git clone <repository-url>
   cd ryt-bank-payment

2. **Install Dependencies**:
   Install the project dependencies using npm or yarn:
   npm install or yarn install

3. **Verify Expo Modules**:
   The app uses expo-local-authentication and expo-contacts. These are already included in package.json, but ensure they’re installed correctly:
   npx expo install expo-local-authentication expo-contacts

## Running the App

1. **Start the Expo Development Server**:
   Run the following command to start the app:
   npx expo start

2. **Run on a Physical Device**:
   a. Ensure the Expo Go app is installed on your Android or IOS device.
   b. Open the Expo Go app and scan the QR code from the terminal or browser:
   c. Ensure your device and computer are on the same Wi-Fi network. If connection issues occur, try using a tunnel:
   npx expo start --tunnel
