const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabaseAdmin
    .from("lesson_files")
    .select("*")
    .limit(1);
    
  console.log("Schema check by selecting 1 row:", data, error);
}

main();
