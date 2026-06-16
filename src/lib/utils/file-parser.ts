/**
 * Extracts raw text from an uploaded File object.
 * Supports .txt and .pdf files.
 */
export async function extractTextFromFile(file: File): Promise<string | null> {
  try {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();

    // Text File
    if (fileType === "text/plain" || fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(arrayBuffer);
    }

    // PDF File
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      const buffer = Buffer.from(arrayBuffer);
      // Import động thư viện pdf-parse để tránh lỗi Webpack/ESM trên Next.js
      let pdf;
      try {
         pdf = (await import("pdf-parse")).default;
      } catch (e) {
         pdf = require("pdf-parse");
      }
      const data = await pdf(buffer);
      return data.text;
    }

    // DOCX File
    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
      const buffer = Buffer.from(arrayBuffer);
      const mammoth = await import("mammoth");
      const extractor = mammoth.extractRawText || (mammoth.default && mammoth.default.extractRawText);
      if (extractor) {
        const result = await extractor({ buffer });
        return result.value;
      }
      // Fallback
      const reqMammoth = require("mammoth");
      const result2 = await reqMammoth.extractRawText({ buffer });
      return result2.value;
    }

    // Unhandled file types
    console.warn(`[FileParser] Unhandled file type: ${fileType} for file: ${fileName}`);
    return null;
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return null;
  }
}
