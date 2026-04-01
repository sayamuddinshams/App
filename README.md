# My App

A full-stack web application for managing items with a PostgreSQL database.

## Features

- Add, view, and delete items
- RESTful API backend built with Express.js
- Simple frontend UI with Axios for API calls
- Docker containerized for easy deployment

## Prerequisites

- Docker and Docker Compose installed on your system

## Installation and Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/sayamuddinshams/App.git
   cd my-app
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to access the frontend.

The backend API will be available at [http://localhost:5000](http://localhost:5000).

## API Endpoints

- `GET /api` - Health check endpoint
- `GET /api/items` - Retrieve all items
- `POST /api/items` - Add a new item (requires JSON body with `text` field)
- `DELETE /api/items/:id` - Delete an item by ID

## Project Structure

```
my-app/
├── docker-compose.yml    # Docker Compose configuration
├── backend/              # Backend service
│   ├── Dockerfile        # Backend Docker configuration
│   ├── package.json      # Backend dependencies
│   └── server.js         # Express.js server with PostgreSQL integration
├── frontend/             # Frontend service
│   ├── Dockerfile        # Frontend Docker configuration
│   ├── package.json      # Frontend dependencies
│   └── server.js         # Express.js server serving HTML UI
└── README.md             # This file
```

## Development

For local development without Docker:

1. Ensure Node.js (v14+) and PostgreSQL are installed
2. Create a PostgreSQL database named `appdb` with user `appuser` and password `apppass`
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
5. Start the backend:
   ```bash
   cd backend
   node server.js
   ```
6. Start the frontend:
   ```bash
   cd frontend
   node server.js
   ```

## License

This project is licensed under the MIT License.