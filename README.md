## Setup Instructions

Follow these steps to set up the project locally:

1. **Clone the Repository**:

   git clone <repository-url>

   cd ryt-bank-payment

2. **Install Dependencies**:
   Install the project dependencies using npm or yarn:

   npx expo install

## Running the App

1. **Start the Expo Development Server**:
   Run the following command to start the app:

   npx expo start

2. **Run on a Physical Device**:
   a. Ensure the Expo Go app is installed on your Android or IOS device.
   b. Open the Expo Go app and scan the QR code from the terminal or browser:
   c. Ensure your device and computer are on the same Wi-Fi network. If connection issues occur, try using a tunnel:

   npx expo start --tunnel

## Export to APK

1. **follow the guide**:
   https://docs.expo.dev/build-reference/apk/

## Demo Video: https://drive.google.com/file/d/1D8NYKHg1Shyp8TpNoAjxPyPYnavtjSyZ/view?usp=drive_link

## Design Decision & Challenge

1. Faced a design limitation while implementing the "Recent Payment" section on the payment page, as most of the screen space was already occupied.
   Solution: Introduced a tab layout to group User Contacts and Recent Transactions together.

2. Initial implementation only included a Payment Page and a Confirmation Page as per requirements. However, this made the app appear unpolished and lacking in content.
   Solution: Designed and added a Home Page (UI inspired by Touch 'n Go) along with a Transaction History section to enhance overall appearance and functionality.

3. Grammar inconsistencies in labels and text affected the app’s professional look.
   Solution: Improved all text and labels using AI tools to ensure proper grammar and consistency.

## Potential New Feature

1.  Internationalisation / Translation: Implement multiple language support using the i18n library to cater to diverse users.

2.  Theme Switcher: Add a feature to toggle between Light Mode and Dark Mode for better user experience and accessibility.
