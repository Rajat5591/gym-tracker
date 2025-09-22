# 🏋️ GymTracker - MERN Stack Workout Tracker

A complete gym workout tracking application built with the MERN stack (MongoDB, Express.js, React, Node.js), inspired by popular apps like Hevy and Strong.

![GymTracker Demo](https://via.placeholder.com/800x400?text=GymTracker+Demo)

## ✨ Features

- 🔥 **Workout Logging** - Track sets, reps, weight, and rest times
- 📊 **Progress Analytics** - Visualize your strength gains with charts
- 💪 **Exercise Database** - 25+ pre-loaded exercises with instructions
- ⏱️ **Rest Timer** - Built-in timer between setss
- 🏃 **Custom Routines** - Create and save workout templates
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🌙 **Dark/Light Mode** - Easy on the eyes during workouts
- 📈 **Personal Records** - Track your PRs automatically
- 👥 **User Profiles** - Personal stats and achievements

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed on your system:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   # If you have the zip file, extract it
   # If you have git access:
   git clone <repository-url>
   cd gym-tracker-mern
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install-all

   # OR install manually:
   # Backend dependencies
   cd backend && npm install

   # Frontend dependencies  
   cd ../frontend && npm install

   # Go back to root
   cd ..
   ```

3. **Set Up Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit the .env file with your settings
   # You can use any text editor like notepad, vscode, etc.
   ```

   **Important**: Edit the `.env` file and update these values:
   ```env
   MONGODB_URI=mongodb://localhost:27017/gym-tracker
   JWT_SECRET=your-super-secret-jwt-key-change-this
   CLIENT_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**

   **Windows:**
   - Open Command Prompt as Administrator
   - Run: `net start mongodb`
   - Or start MongoDB Compass and connect to `mongodb://localhost:27017`

   **Mac/Linux:**
   ```bash
   # Using Homebrew (Mac)
   brew services start mongodb-community

   # Or manually
   sudo mongod
   ```

5. **Seed the Database (Important!)**
   ```bash
   # This adds sample exercises to your database
   npm run seed
   ```

6. **Start the Application**
   ```bash
   # Start both frontend and backend together
   npm run dev
   ```

   **The app will open in your browser at:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 How to Use

### Getting Started
1. **Visit** http://localhost:3000
2. **Click "Get Started Free"** to create an account
3. **Fill in** your details and click "Create Account"
4. **You're in!** Start exploring your dashboard

### Your First Workout
1. **Click the "Workout" tab** at the bottom
2. **Press "Start Workout"** 
3. **Click "Add Exercise"** and search for exercises
4. **Select an exercise** from the list
5. **Log your sets** by entering weight and reps
6. **Click the ✓ button** to complete each set
7. **Press "Finish"** when you're done

### Creating Routines
1. **Go to "Routines" tab**
2. **Click "Create Routine"**
3. **Add exercises** and set target reps/weight
4. **Save your routine** for future workouts

### Tracking Progress
1. **Visit your "Profile"** to see statistics
2. **Check the "Dashboard"** for weekly progress charts
3. **View your personal records** and workout history

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - Database ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend  
- **React** - UI library
- **React Router** - Navigation
- **Styled Components** - Styling
- **Recharts** - Data visualization
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
gym-tracker-mern/
├── backend/                 # Node.js/Express backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── config/            # Database configuration
│   ├── data/              # Seed data
│   └── server.js          # Main server file
├── frontend/               # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── context/       # State management
│       ├── hooks/         # Custom hooks
│       ├── utils/         # Helper functions
│       └── styles/        # Styling & themes
├── package.json           # Root package file
└── README.md             # This file
```

## 🎯 Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development (both frontend & backend)
npm run dev

# Start backend only
npm run server

# Start frontend only  
npm run client

# Seed database with sample data
npm run seed

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Troubleshooting

### Common Issues

1. **"Cannot connect to MongoDB"**
   - Make sure MongoDB is running
   - Check your MONGODB_URI in .env file
   - Try: `mongodb://127.0.0.1:27017/gym-tracker`

2. **"Module not found" errors**
   - Delete node_modules folders and run `npm run install-all`
   - Make sure you're in the correct directory

3. **Port already in use**
   - Change PORT in .env file
   - Or kill the process: `lsof -ti:5000 | xargs kill -9` (Mac/Linux)

4. **Frontend won't start**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **No exercises showing**
   - Run the seed command: `npm run seed`
   - Check if MongoDB is connected

### Need Help?
- Check the console for error messages
- Make sure all prerequisites are installed
- Verify your .env file is configured correctly

## 🚀 Deployment

### Deploy to Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Set up MongoDB Atlas (cloud database)
4. Deploy:
   ```bash
   heroku create your-gym-tracker
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   git push heroku main
   ```

### Deploy Frontend to Vercel
1. Build the frontend: `cd frontend && npm run build`
2. Deploy to Vercel: `npx vercel --prod`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Hevy](https://hevyapp.com) and [Strong](https://strong.app)
- Exercise data curated from fitness communities
- Icons from [Heroicons](https://heroicons.com/)

---

**Built with ❤️ for the fitness community**

*Happy lifting! 💪*
