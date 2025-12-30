import { createClient } from "@supabase/supabase-js";

// Supabase client configuration
// This will be used for real-time updates and database operations

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Note: To initialize Supabase:
// 1. Create a project at https://app.supabase.com
// 2. Copy your project URL and anon key
// 3. Create a .env.local file based on .env.local.example
// 4. Add your credentials to .env.local
