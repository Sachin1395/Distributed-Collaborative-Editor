
// import { createClient } from '@supabase/supabase-js'
// const supabaseUrl = 'https://kxxahdmrllsqgwzwfwbq.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGFoZG1ybGxzcWd3endmd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NTU5NjksImV4cCI6MjA3MjEzMTk2OX0.HxEP81wyoEiFRh3np6e2Tt-SwWxpeHy6BTuPxipqeWk'
// export const supabase = createClient(supabaseUrl, supabaseKey)


import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env vars missing")
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
