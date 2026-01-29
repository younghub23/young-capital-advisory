/**
 * Supabase Configuration for Young Capital Advisory
 */

const SUPABASE_URL = 'https://rutmbjtnglssefjpimch.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dG1ianRuZ2xzc2VmanBpbWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDgzNjUsImV4cCI6MjA4NTIyNDM2NX0.xCy3KDvf0ohleUszHr-OiAv4xIJEcj-jzjBt1sJ9g-s';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase initialized successfully');
