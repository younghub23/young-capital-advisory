/**
 * Supabase Configuration
 *
 * To set up Supabase:
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project
 * 3. Go to Settings > API in your project dashboard
 * 4. Copy your Project URL and paste it below as SUPABASE_URL
 * 5. Copy your anon/public key and paste it below as SUPABASE_ANON_KEY
 * 6. Go to Authentication > Providers and ensure Email is enabled
 * 7. (Optional) Disable email confirmations for testing:
 *    Go to Authentication > Providers > Email and turn off "Confirm email"
 */

// Replace these with your Supabase project credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
let supabase = null;

if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized successfully');
} else {
    console.warn('Supabase not configured. Using localStorage fallback for authentication.');
    console.warn('To enable Supabase auth, update js/supabase-config.js with your credentials.');
}
