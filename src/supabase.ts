import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ljlidhwudeguxkyqqzup.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbGlkaHd1ZGVndXhreXFxenVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MjQwOTMsImV4cCI6MjA1NzQwMDA5M30.autvENXRb_3MMSzukn_X03UHdnGXjw8LTTvcZUS01yo"
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const storage = supabase.storage;
