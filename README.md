**QueueFlow - Smart Queue Management System**

**Project Overview**

QueueFlow is a smart virtual queue management system developed using the MERN stack. The system allows users to join queues remotely while enabling administrators to manage queue flow efficiently through a dedicated admin service desk.

The project focuses on:

- Token-based queue management
- FIFO queue processing
- Role-based access control
- Admin and user separation
- Real-time queue tracking

**Features**

**User Features**

- User authentication and login
- Join available queues
- Receive virtual token numbers
- Track queue position
- View current queue status
- Cancel own queue token

**Admin Features**

- Manage all queues
- View service desk dashboard
- Call next customer
- Complete serving tokens
- Remove users from queue
- Promote waiting users to reserved
- Add walk-in customers
- View active customers in queue

**Tech Stack**

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

**Frontend**

- React.js

**Other Tools**

- Git & GitHub
- Postman

**Project Structure**

QUEUEFLOW/

client/

config/

db.js

constants/

tokenStatus.js

controllers/

adminDeskController.js

adminQueueController.js

authController.js

userTokenController.js

middleware/

asyncHandler.js

authMiddleware.js

errorMiddleware.js

roleMiddleware.js

models/

queue.js

token.js

user.js

routes/

admin/  
deskRoutes.js  
queueRoutes.js  
user/  
authRoutes.js

scripts/

seedAdmin.js

services/

authService.js

queueService.js

tokenService.js

utils/

AppError.js

estimateTime.js

.env

app.js

server.js

package.json

README.md

**Installation Guide**

**1\. Clone Repository**

git clone <https://github.com/Luxica13/QueueFlow-2022ICT118.git>  
cd QueueFlow

**2\. Install Backend Dependencies**

npm install

**3\. Install Frontend Dependencies**

cd client  
npm install

**4\. Configure Environment Variables**

Create a .env file in the root directory:

PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/queueflow

JWT_SECRET=queueflow_dev_secret_change_in_production

JWT_EXPIRES=7d

ADMIN_EMAIL=<admin@queueflow.com>

ADMIN_PASSWORD=admin123

**5\. Start Backend Server**

npm start

**6\. Start Frontend**

cd client  
npm start

**Authentication & Authorization**

The system uses JWT-based authentication with role-based authorization.

**Roles**

**Admin**

Admins can:

- Manage queues
- Access service desk
- Update token statuses
- Remove customers
- Call next tokens

**User**

Users can:

- Join queues
- Track their own tokens
- View queue status
- Cancel their own token

**Queue Status Types**

waiting  
reserved  
serving  
completed  
removed  
cancelled

**Queue Processing Logic**

- Queue order is managed using token order (FIFO)
- Customers are processed based on token number
- Removed customers disappear from active queue
- Reserved users maintain correct queue ordering
- Service desk updates automatically after status changes

**API Endpoints**

**Authentication**

| Method | Endpoint        | Access        |
| ------ | --------------- | ------------- |
| POST   | /api/auth/login | Public        |
| GET    | /api/auth/me    | Authenticated |

**Admin Routes**

| Method | Endpoint                        | Access          |
| ------ | ------------------------------- | --------------- |
| CRUD   | /api/admin/queues               | Admin           |
| GET    | /api/admin/desk/board/:queueId  | Admin           |
| POST   | /api/admin/desk/call-next       | Admin           |
| PUT    | /api/admin/desk/complete/:id    | Admin           |
| PUT    | /api/admin/desk/remove/:id      | Admin           |
| POST   | /api/admin/desk/promote-waiting | Admin           |
| POST   | /api/admin/desk/join            | Admin (Walk-in) |
| GET    | /api/admin/desk/customers       | Admin           |

**User Routes**

| Method | Endpoint              | Access                |
| ------ | --------------------- | --------------------- |
| GET    | /api/user/queues/open | User                  |
| POST   | /api/user/join        | User                  |
| GET    | /api/user/mine        | User                  |
| GET    | /api/user/:id         | User (Own Token Only) |
| PUT    | /api/user/:id/cancel  | User (Own Token Only) |

**Improvements Made**

- Separated admin and user functionality
- Added role-based route protection
- Refactored queue sorting to FIFO token order
- Improved queue status handling
- Removed MongoDB transaction usage
- Simplified backend CRUD logic
- Improved queue synchronization between frontend and backend

**Future Enhancements**

- Real-time updates using Socket.io
- SMS/Email notifications
- QR code token scanning
- Queue analytics dashboard
- Multi-branch support

**Author**

Luxica Pratheepan

**License**

This project is developed for educational and learning purposes.
