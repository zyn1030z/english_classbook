import { NextResponse } from "next/server";
import { extractLessonContent } from "@/lib/gemini/extractors/lesson-extractor";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const text = await extractText(file);
  const extracted = await extractLessonContent(text);

  return NextResponse.json({
    file: {
      name: file.name,
      type: file.type,
      size: file.size
    },
    extracted
  });
}

async function extractText(file: File) {
  if (file.type.startsWith("text/") || file.name.endsWith(".txt")) {
    return file.text();
  }

  // PDF, DOCX, PPTX, and OCR workers can be added behind this API without changing callers.
  return `Imported file: ${file.name}. Add parser worker for ${file.type || "unknown type"}.`;
}
