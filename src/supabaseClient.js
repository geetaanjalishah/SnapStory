import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your project URL and anon key
const supabase = createClient(
  'https://knqhnwzxxdkgsbhzjoge.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucWhud3p4eGRrZ3NiaHpqb2dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NTE3MTEsImV4cCI6MjA0OTQyNzcxMX0.hS5zsv69lU18aytcte21NwvXi3jzyD2WyDa6lGUzN94' // Replace with your Supabase anon key
);



export default supabase;



