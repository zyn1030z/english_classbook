const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function init() {
  const { data, error } = await supabaseAdmin.storage.createBucket('lesson-files', {
    public: false,
    fileSizeLimit: 10485760
  });
  if (error && error.message !== 'The resource already exists') {
    console.error("Lỗi:", error.message);
  } else {
    console.log("Bucket 'lesson-files' đã sẵn sàng!");
  }
}
init();
