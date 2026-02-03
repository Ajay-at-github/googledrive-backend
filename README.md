# Google Drive Clone - Backend

A full-featured Google Drive clone backend API built with Node.js, Express, MongoDB, and AWS S3.

## Features

- User authentication (register, login, email activation, password reset)
- File upload, download, update, and delete
- Folder management (create, read, update, delete)
- AWS S3 integration for file storage
- User storage quota management
- Email notifications
- JWT-based authentication
- Secure password hashing

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **AWS S3** - File storage
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- AWS Account (for S3)
- SMTP email account

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd googledrive-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update with your credentials
   - Update MongoDB URI
   - Add AWS credentials
   - Configure SMTP settings

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/activate/:token` - Activate account
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Files
- `POST /api/files` - Upload file
- `GET /api/files` - Get all files
- `GET /api/files/:id` - Get file by ID
- `GET /api/files/:id/download` - Download file
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

### Folders
- `POST /api/folders` - Create folder
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get folder by ID
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

## Project Structure

```
googledrive-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── app.js           # Express app
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies
└── README.md           # Documentation
```

## Environment Variables

See `.env` file for all required environment variables.

## License

ISC
