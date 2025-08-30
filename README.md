# AI Tutor Chat

An intelligent AI-powered tutoring application that helps users learn through conversational AI, automatic note-taking, and study analytics.

## How the App Works

### 1. Initial Setup
- When you first open the app, you'll need to set up the AI by providing a Google AI API key
- Tap the "Setup AI" button and enter your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- The API key is stored locally on your device and never shared

### 2. Chat with AI Tutor
- Start a conversation by typing any question or topic you want to learn about
- The AI provides educational responses using markdown formatting for better readability
- Responses include headings, bold text, lists, code blocks, and other formatting
- The chat features a streaming effect where text appears gradually for a natural conversation feel

### 3. Quick Actions
After sending a message, you can use quick action buttons to:
- **Explain Simply**: Get a simpler explanation of the concept
- **Give Examples**: Receive practical examples to illustrate the concept
- **Quiz Me**: Get a quiz question or practice problem on the topic

### 4. Automatic Key Point Extraction
- The AI automatically extracts key points from its responses
- These key points appear in a "📝 Key Points" section below each AI response
- Key points are extracted from headers, lists, bold text, code blocks, and important sentences

### 5. Save to Notes
- Click the "Save to Notes" button to save extracted key points to your notes
- Notes are organized by topic and can be viewed in the Notes tab
- Each note shows whether it was automatically extracted or manually added

### 6. Notes Management
- Access the Notes tab to view all your saved notes
- Switch between list view and grouped view (by topic)
- Manually add notes using the "+" button
- Edit or delete existing notes as needed
- Notes support markdown formatting for rich content

### 7. Study Analytics
- The Analytics tab provides insights into your learning patterns
- Track your study streak (consecutive days of learning)
- View total sessions and questions asked
- See your most studied topics
- Monitor your study activity over the last 7 days
- Analytics update automatically as you chat and save notes

### 8. Session Management
- Start a new session anytime using the refresh button in the chat header
- Sessions help organize your learning and provide better analytics
- Each session tracks the topics discussed and questions asked

### 9. Error Handling
- The app gracefully handles errors and provides helpful messages
- If analytics fail to load, you'll see an error screen with a retry option
- Network issues or API problems are handled with appropriate feedback

## Technical Features

- **Streaming Responses**: AI responses appear word by word for a natural conversation experience
- **Markdown Support**: Rich text formatting in both chat and notes
- **Local Storage**: All data is stored locally on your device
- **Responsive Design**: Works well on both iOS and Android devices
- **Error Recovery**: Robust error handling prevents crashes and provides recovery options

## Privacy & Security

- Your API key is stored locally and never transmitted to any server except Google's AI services
- All conversations and notes are stored locally on your device
- No personal data is collected or shared with third parties

## Getting Started

1. Install the app on your device
2. Open the app and set up your Google AI API key
3. Start asking questions and learning!
4. Save important points as notes for future reference
5. Track your learning progress in the Analytics tab

Enjoy learning with your AI Tutor!
