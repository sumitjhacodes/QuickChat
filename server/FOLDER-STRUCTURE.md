# Step 10 — Clean Project Architecture

A scalable folder structure keeps the codebase organized and makes it easier to maintain as the application grows.

```text
src/
│
├── config/
│   ├── db.js
│   ├── socket.js
│   └── env.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   └── message.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validation.middleware.js
│
├── models/
│   ├── User.js
│   ├── Message.js
│   └── Room.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── message.routes.js
│
├── services/
│   ├── auth.service.js
│   ├── user.service.js
│   └── message.service.js
│
├── sockets/
│   ├── index.js
│   ├── chat.socket.js
│   └── presence.socket.js
│
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── logger.js
│   └── jwt.js
│
├── validations/
│   ├── auth.validation.js
│   ├── message.validation.js
│   └── user.validation.js
│
├── app.js
└── server.js
```

---

# Folder Breakdown

## 📁 config/

Contains application configuration files.

### db.js

* Connects the application to MongoDB.
* Exports the database connection function.

### socket.js

* Creates and configures the Socket.IO server.
* Sets CORS and socket options.

### env.js

* Loads environment variables.
* Exports configuration values for use throughout the application.

---

## 📁 controllers/

Controllers receive HTTP requests and return HTTP responses.

They should contain minimal business logic and delegate work to services.

### auth.controller.js

Handles:

* User registration
* User login
* Refresh tokens (optional)
* Logout

### user.controller.js

Handles:

* Fetch current user
* Update profile
* User search
* User details

### message.controller.js

Handles:

* Fetch chat history
* Fetch private conversations
* Delete or edit messages (optional)

---

## 📁 middleware/

Middleware executes before or after route handlers.

### auth.middleware.js

* Verifies JWT
* Authenticates users
* Attaches the authenticated user to the request object

### error.middleware.js

* Handles application errors centrally
* Returns consistent error responses

### validation.middleware.js

* Validates incoming request data
* Prevents invalid payloads from reaching controllers

---

## 📁 models/

Defines MongoDB collections using Mongoose schemas.

### User.js

Represents application users.

Example fields:

* username
* email
* password
* avatar
* status

### Message.js

Represents chat messages.

Example fields:

* sender
* receiver
* room
* content
* timestamps

### Room.js

Represents chat rooms.

Example fields:

* roomName
* members
* createdBy

---

## 📁 routes/

Defines API endpoints.

Routes only map URLs to controller functions.

### auth.routes.js

```text
POST /signup
POST /login
POST /logout
```

### user.routes.js

```text
GET /me
GET /users
PATCH /profile
```

### message.routes.js

```text
GET /messages/:room
GET /messages/private/:userId
```

---

## 📁 services/

Contains the application's business logic.

Services communicate with the database and perform operations.

### auth.service.js

Responsibilities:

* Hash passwords
* Compare passwords
* Generate JWTs
* Verify JWTs

### user.service.js

Responsibilities:

* Retrieve users
* Update user profiles
* Search users

### message.service.js

Responsibilities:

* Save messages
* Retrieve chat history
* Retrieve private conversations

---

## 📁 sockets/

Contains all Socket.IO event handlers.

Keeping socket logic separate from Express routes makes the project easier to maintain.

### index.js

* Initializes Socket.IO.
* Registers all socket modules.

### chat.socket.js

Handles events such as:

```text
connection
join-room
leave-room
send-message
receive-message
disconnect
```

### presence.socket.js

Handles:

* User online status
* User offline status
* Active user tracking
* Presence broadcasts

---

## 📁 utils/

Contains reusable helper functions and utilities.

### ApiError.js

Custom error class used across the application.

### ApiResponse.js

Provides a consistent API response structure.

Example:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {}
}
```

### logger.js

Centralized logging utility.

Can later integrate:

* Winston
* Morgan
* Pino

### jwt.js

Utility functions for:

* Creating JWTs
* Verifying JWTs
* Decoding tokens

---

## 📁 validations/

Stores request validation schemas.

### auth.validation.js

Validates:

* Signup requests
* Login requests

### message.validation.js

Validates:

* Message content
* Room IDs
* Receiver IDs

### user.validation.js

Validates:

* Profile updates
* Username
* Avatar
* Email

---

## 📄 app.js

Creates and configures the Express application.

Responsibilities:

* Initialize Express
* Register middleware
* Register routes
* Configure CORS
* Register global error handler

This file **does not start the server**.

---

## 📄 server.js

Application entry point.

Responsibilities:

* Load environment variables
* Connect to MongoDB
* Create the HTTP server
* Initialize Socket.IO
* Start listening on the configured port

Everything begins from this file.
