const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabaseAdmin.from("lesson_files").insert({
    lesson_id: "e44bd0ea-1234-5678-abcd-1234567890ab", // Fake ID format for type testing
    file_name: "test.docx",
    file_path: "test/test.docx",
    file_size: 100,
    mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  console.log("Error details:", JSON.stringify(error, null, 2));
}

main();
