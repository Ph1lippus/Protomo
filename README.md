# PROTOMO

This is a minimalist webpage being created for productivity, in its final form it should have a timer that tracks study sessions on Supabase, for persistence, and future progress analysis.

Features:
- Study/Break are configurable.
- Able to skip current block.
- Auto switch between study and break.
- Persistence between sessions.
- Live clock, date and more for some quick information.
- User authentication with Supabase.
- Sessions saved to Supabase database.

Stack:
- React
- TypeScript
- Bootstrap
- Supabase
- React Router

Setup:
1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with your Supabase credentials (see `.env.example`)
4. Set up the Supabase database using the SQL in `supabase-schema.sql`
5. Run `npm run dev` to start the development server

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Go to Settings > API to get your URL and anon key
3. Run the SQL from `supabase-schema.sql` in the SQL editor
4. Enable Email authentication in the Auth settings
5. Add your credentials to the `.env` file