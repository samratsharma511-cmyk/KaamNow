# KaamNow — Connecting Skills with Opportunities

**KaamNow** is a managed on-demand service marketplace that connects households and customers in India with verified local professionals (**KaamSaathis**) across 8 core trades: Electricians, Plumbers, Carpenters, Painters, Mechanics, AC Technicians, Appliance Repair Technicians, and Cleaning Professionals.

Unlike static directories, KaamNow manages the complete service lifecycle:
1. **Digital Professional Identity** for workers (skills, experience, visit charge, portfolio photos, and verified customer ratings).
2. **Automatic Nearest-Worker Dispatch** using Haversine distance calculation, online availability filtering, and automatic 45-second timeout/rejection fallback to the next closest worker.
3. **Atomic Assignment & Validated Status Transitions** (`SEARCHING` → `REQUESTED` → `ACCEPTED` → `ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED`).
4. **Authorized Live Location Tracking** via private Socket.IO rooms (`booking:<id>`) and Leaflet + OpenStreetMap.
5. **Verified Post-Job Reviews & Ratings** (one review per completed booking, restricted to the booking customer).

---

## Project Structure

```text
SAMRAT_WEB/
├── client/                     # React + Vite + Tailwind CSS + Leaflet + Socket.IO Client
│   ├── src/
│   │   ├── components/         # Navbar, Footer, ProtectedRoute, MapView, WorkerCard, StatusBadge
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── public/         # Landing, Login, Register, About, Services (5 pages)
│   │   │   ├── customer/       # Home, Search, WorkerProfile, Book, Confirmation, LiveTracking, MyBookings, Details, Profile (9 pages)
│   │   │   └── worker/         # Home, EditProfile, JobRequests, ActiveJob, LiveNavigation, MyJobs, Earnings, Reviews, Settings (9 pages)
│   │   ├── services/           # Axios API instance with JWT interceptor
│   │   └── utils/              # Status configs, Haversine helpers, constants
│   └── package.json
├── server/                     # Node.js + Express + Prisma ORM + PostgreSQL + Socket.IO
│   ├── prisma/
│   │   ├── schema.prisma       # 9 normalized models (User, WorkerProfile, ServiceCategory, Service, WorkerService, Booking, BookingStatusHistory, WorkerLocation, Review)
│   │   └── seed.js             # Seeds 8 categories, 24 services, 4 customers, 12 workers, bookings & reviews
│   ├── src/
│   │   ├── config/             # Prisma client singleton
│   │   ├── controllers/        # Auth, Service, Worker, Booking, Review controllers
│   │   ├── middleware/         # JWT authentication & role-based authorization
│   │   ├── routes/             # Express API routers
│   │   ├── services/           # Automatic worker assignment & timeout fallback engine
│   │   ├── sockets/            # Authenticated Socket.IO server & private booking rooms
│   │   └── utils/              # Haversine distance & booking number generator
│   └── package.json
└── README.md
```

---

## Technology Stack

- **Frontend:** React 18, Vite, JavaScript, Tailwind CSS, React Router v6, Axios, Socket.IO Client, Leaflet & OpenStreetMap (`react-leaflet`)
- **Backend:** Node.js, Express.js, Socket.IO, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Database:** PostgreSQL with Prisma ORM

---

## Local Setup & Running Instructions

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** running locally on port `5432`

Create the `kaamnow` database in PostgreSQL if it does not exist yet:
```bash
createdb kaamnow
```

### 2. Configure Environment Variables

**Backend (`server/.env`)** — already pre-configured for local development:
```env
PORT=5001
DATABASE_URL="postgresql://krish@localhost:5432/kaamnow?schema=public"
JWT_SECRET="kaamnow_super_secret_jwt_key_2026_dev_only"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
REQUEST_TIMEOUT_SECONDS=45
```
*(Update `DATABASE_URL` username/credentials if your local PostgreSQL setup uses `postgres:postgres`.)*

**Frontend (`client/.env`)** — already pre-configured:
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```
*(Note: OpenStreetMap tiles are used with Leaflet, so no paid external map API key is required.)*

### 3. Install Dependencies, Push Schema & Seed Database

From the `server/` directory:
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
```

From the `client/` directory:
```bash
cd ../client
npm install
```

### 4. Start the Application

Start the backend server (`http://localhost:5001`):
```bash
cd server
npm run dev
```

In a second terminal, start the frontend Vite server (`http://localhost:5173`):
```bash
cd client
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## Development-Only Demo Credentials

*(Note: These credentials are for local development and testing only. All seeded accounts use the shared development password `password` + `123`, and the Login page includes 1-click Demo Login buttons.)*

| Role | Name | Profession / Area | Email | Development Password |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Aarav Sharma | Indiranagar, Bengaluru | `customer@kaamnow.in` | `password123` |
| **Customer** | Priya Nair | Koramangala, Bengaluru | `priya@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Rajesh Kumar | Electrician (Indiranagar) | `worker@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Suresh Gowda | Plumber (Koramangala) | `suresh.plumber@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Imran Khan | AC Technician (HSR Layout) | `imran.ac@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Vishwakarma Ramesh | Carpenter (Jayanagar) | `ramesh.carpenter@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Manjunath Shetty | Mechanic (Indiranagar) | `manjunath.mechanic@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Deepak Verma | Painter (BTM Layout) | `deepak.painter@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Karthik Murugan | Appliance Repair (Domlur) | `karthik.appliance@kaamnow.in` | `password123` |
| **Worker (KaamSaathi)** | Lakshmi Devi | Cleaning Professional | `lakshmi.cleaning@kaamnow.in` | `password123` |

---

## End-to-End Testing Walkthrough

1. **Customer Booking & Auto-Dispatch**:
   - Log in as **Demo Customer** (`customer@kaamnow.in`) using the 1-click button on `/login`.
   - Browse `/customer/search` with filters (Profession, Distance, Rating, Visit Charge, Online Only) or click **Book a Service** (`/customer/book`).
   - Select an electrical service, enter a problem description, pin your location on the Leaflet map, and submit.
   - KaamNow automatically calculates Haversine distances for online Electricians and dispatches the request to the nearest KaamSaathi (`Rajesh Kumar`).
2. **Worker Acceptance & Status Progression**:
   - Log in as **Demo KaamSaathi** (`worker@kaamnow.in`).
   - See the incoming real-time job offer alert banner or open **Job Requests** (`/worker/requests`) and click **Accept Job**.
   - Open **Live Navigation** (`/worker/jobs/:id/navigate`) and click **Start Browser GPS Sharing** (or **Simulate En-Route Movement** on a desktop) to stream live GPS coordinates over Socket.IO.
   - Progress the job status through `ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED`.
3. **Customer Live Tracking & Review**:
   - On `/customer/bookings/:id/track`, watch the worker marker move in real time on the map.
   - Once completed, open `/customer/bookings/:id` and submit a 1–5 star rating and written review, which immediately updates the worker's public profile and average rating.
