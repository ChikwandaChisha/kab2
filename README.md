# WhisperChain+ Secure Messaging Platform
## Authors: Chikwanda Chisha and Patrick Bongo
WhisperChain+ is an end-to-end encrypted messaging platform focused on privacy and security. This application allows users to send encrypted messages to other users, with features designed for secure communication and content moderation.

## Features

### User Management
- **Secure Authentication**: Email-based authentication system with role-based access control
- **User Roles**: Support for regular users, moderators, and administrators
- **Profile Management**: User profiles with customizable settings

### Messaging System
- **End-to-End Encryption**: Messages are encrypted and can only be decrypted by the intended recipient
- **Anonymous Messaging**: Option to send messages without revealing sender information
- **Real-time Updates**: Instant message delivery and notifications
- **Message Flagging**: Users can flag inappropriate content for review

### Moderation & Administration
- **Moderator Panel**: Special interface for content moderators to review flagged messages
- **Admin Console**: Advanced tools for system administrators to manage users and system settings
- **Token Management**: Security tokens that can be frozen if misused

### Security
- **Token-based Security**: Each message associated with a security token
- **Content Filtering**: System to detect and flag potentially harmful content
- **Audit Logging**: Comprehensive logging of system activities for security review

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query for server state
- **Backend**: Supabase for authentication, database, and real-time subscriptions
- **Build Tool**: Vite for fast development and optimized production builds

## Documentation

- [RBAC.md](docs/RBAC.md): Role-Based Access Control details and permissions.
- [AUDIT_LOGS.md](docs/AUDIT_LOGS.md): Information about audit logging and review processes.
- [SECURITY.md](docs/SECURITY.md): Security policies, practices, and considerations for the project.

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn package manager
- Supabase account (for backend services)

### Installation

1. Clone the repository
```sh
git clone <repository-url>
cd whisperchain-plus
```

2. Install dependencies
```sh
npm install
# or
yarn install
```

3. Set up environment variables

To make the backend setup easier, the Supabase configuration is already set up in the codebase at `src/integrations/supabase/client.ts`. No additional environment variables are needed to run the application.

4. Start the development server
```sh
npm run dev
# or
yarn dev
```

### Deployment

This application can be deployed to any static hosting service, such as Vercel, Netlify, or GitHub Pages. The backend is fully managed by Supabase.

## Project Structure

```
whisperchain-plus/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   ├── pages/           # Application pages
│   ├── services/        # Business logic and API calls
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
└── supabase/            # Supabase configuration
```

## Security Considerations

WhisperChain+ implements several security best practices:

- All messages are encrypted before being sent to the server
- User authentication leverages Supabase's secure auth system
- Row-level security policies in Supabase ensure data isolation
- Token-based message system provides an additional layer of security

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please open an issue in the project repository.

## Acknowledgments

We would like to acknowledge the assistance provided by lovable devf in the development of this project.

## Access Information


### Admin Access
Note: The admin functionality was not fully implemented as it was not deemed necessary for the core functionality of the application. The admin role and related features are currently disabled.
