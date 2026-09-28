export async function extractText(file: File) {
  const name = file.name.toLowerCase();
  let text = "";
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
    const doc = await task.promise;
    if (doc.numPages > 80) {
      await task.destroy();
      throw new Error("PDF: maximum 80 pages. Split the document first.");
    }
    for (let n = 1; n <= doc.numPages; n++) {
      const p = await doc.getPage(n);
      const data = await p.getTextContent();
      text += data.items.map((item: any) => item.str || "").join(" ") + "\n";
      if (text.length > 80000) {
        await task.destroy();
        throw new Error("Document is too long. Split it into smaller files.");
      }
    }
    await task.destroy();
    if (!text.trim())
      throw new Error("This PDF is scanned. Upload its pages as images.");
  } else if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    text = (
      await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    ).value;
  } else if (
    file.type.startsWith("text/") ||
    /\.(txt|md|csv|tsv|json|js|ts|py|html|css|xml|yaml|yml|log|sql)$/.test(name)
  )
    text = await file.text();
  else if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type))
    throw new Error("Use PNG, JPG, WebP, GIF, PDF, DOCX or a text file.");
  if (text.length > 80000)
    throw new Error("Document is too long. Split it into smaller files.");
  return text;
}
