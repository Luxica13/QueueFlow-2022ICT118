QueueFlow - Smart Queue Management System

Project Overview:

QueueFlow is a smart virtual queue management system developed using the MERN stack. The system allows users to join queues remotely while enabling administrators to manage queue flow efficiently through a dedicated admin service desk.

The project focuses on:

Token-based queue management
FIFO queue processing
Role-based access control
Admin and user separation
Real-time queue tracking

Features:

User Features:
User authentication and login
Join available queues
Receive virtual token numbers
Track queue position
View current queue status
Cancel own queue token

Admin Features:
Manage all queues
View service desk dashboard
Call next customer
Complete serving tokens
Remove users from queue
Promote waiting users to reserved
Add walk-in customers
View active customers in queue

Tech Stack:

Backend:
Node.js
Express.js
MongoDB
Mongoose
JWT Authentication

Frontend:
React.js

Other Tools:
Git & GitHub
Postman

Project Structure:
QUEUEFLOW/
│
├── client/
├── config/
│   └── db.js
│
├── constants/
│   └── tokenStatus.js
│
├── controllers/
│   ├── adminDeskController.js
│   ├── adminQueueController.js
│   ├── authController.js
│   └── userTokenController.js
│
├── middleware/
│   ├── asyncHandler.js
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── queue.js
│   ├── token.js
│   └── user.js
│
├── routes/
│   ├── admin/
│   │   ├── deskRoutes.js
│   │   └── queueRoutes.js
│   │
│   ├── user/
│   └── authRoutes.js
│
├── scripts/
│   └── seedAdmin.js
│
├── services/
│   ├── authService.js
│   ├── queueService.js
│   └── tokenService.js
│
├── utils/
│   ├── AppError.js
│   └── estimateTime.js
│
├── .env
├── app.js
├── server.js
├── package.json
└── README.md
