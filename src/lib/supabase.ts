import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvyohfodhaeqchjzcopf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2eW9oZm9kaGFlcWNoanpjb3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDEwOTAsImV4cCI6MjA4NTcxNzA5MH0.CXIW6iRmGbYu9xDKohgtgJ6aYwGz9wXOVKU_0IlmE7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
