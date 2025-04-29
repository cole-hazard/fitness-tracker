# Fitness Tracker App

A full-stack web application designed to help users create, manage, and track their strength training workout plans.

## Features

- **User Authentication:** Secure user registration and login.
- **Workout Plan Management:**
  - Create custom weekly, bi-weekly, 3-week, or 4-week workout plans.
  - Assign specific workouts or rest days to each day within a plan.
  - View all saved workout plans.
  - Select an active workout plan.
- **Workout Creation/Editing:**
  - Build workouts by selecting exercises from a database.
  - Define target sets and rep ranges for each exercise within a workout.
- **Homepage Dashboard:**
  - Displays the current date.
  - Shows the scheduled workout for the current day based on the active plan.
- **Interactive Body Map:**
  - Visualize muscle groups targeted by different exercises.
  - Select exercises to see corresponding muscle groups highlighted.

## Technology Stack

- **Frontend:**
  - React (Vite)
  - Tailwind CSS
  - Zustand (State Management)
  - React Router
  - Axios
- **Backend:**
  - Python
  - Django
  - Django REST Framework (DRF)
  - djangorestframework-simplejwt (JWT Authentication)
- **Database:**
  - PostgreSQL
