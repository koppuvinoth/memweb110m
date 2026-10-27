# MemberHub Project

## Setup Instructions

1. **Install Dependencies:**
   `npm install`

2. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials.

3. **Database Setup:**
   Run the SQL commands found in `supabase_schema.sql` in your Supabase SQL Editor.

4. **Import Data:**
   Add your master JSON data to `import_data.js` and run `node import_data.js` to seed your database.

5. **Add Assets:**
   Place your `Front.jpg` file in the `public/` directory.

6. **Run the App:**
   `npm run dev`
