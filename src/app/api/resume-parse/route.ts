import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return Response.json({ error: "缺少文件" }, { status: 400 });
    }

    const name = file.name.toLowerCase();
    let text: string;

    if (name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
      const result = await extractText(pdf, { mergePages: true });
      text = (result.text ?? "").trim();
    } else if (name.endsWith(".doc") || name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value.trim();
    } else if (name.endsWith(".txt")) {
      text = (await file.text()).trim();
    } else {
      return Response.json(
        { error: "不支持的文件格式，请上传 PDF、Word 或 TXT" },
        { status: 400 }
      );
    }

    return Response.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "解析失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
