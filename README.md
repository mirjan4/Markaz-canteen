# Canteen Meal Planning System

## Setup Instructions

This system consists of a **React Frontend** and a **PHP Backend**.

### 1. Database Setup
1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Go to [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Create a new database named `canteen_db`.
4. Import the file `backend/database.sql` into the `canteen_db` database.
   - Alternatively, you can run the SQL query from the file directly in the SQL tab.

### 2. Backend Setup
1. Move or Copy the `backend` folder to your XAMPP installation's `htdocs` folder.
   - Example: Copy `backend` to `C:\xampp\htdocs\canteen_api`.
2. Open `frontend/src/api.js` and update the `API_BASE_URL` if you used a different path.
   - Default is set to: `http://localhost/canteen/backend/` (assuming you might map it differently).
   - If you copied it to `htdocs\canteen_api`, change it to `http://localhost/canteen_api/`.
3. **Initialize Admin**:
   - Open your browser and go to your backend URL + `install.php`.
   - Example: `http://localhost/canteen_api/install.php`.
   - This will create the default Super Admin user:
     - **Phone**: `9999999999`
     - **Password**: `admin`

### 3. Frontend Setup
1. Open a terminal in the `frontend` folder.
2. Run `npm install` (if not done already).
3. Run `npm run dev`.
4. Open the link shown (usually `http://localhost:5173/`).

### 4. Logging In
- **Admin**: Use `9999999999` / `admin`.
- **Teacher**: Admin needs to create teacher accounts first via the Admin Dashboard. Default password for teachers is their phone number.

## Features
- **Super Admin**: View detailed meal reports for Today and Tomorrow. Create Teacher accounts.
- **Teacher**: Login and toggle Yes/No for Breakfast, Lunch, and Dinner for Today and Tomorrow.
