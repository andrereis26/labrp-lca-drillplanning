import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// schema for the file upload
const fileUploadSchema = z.object({
  file: z.string().refine((path) => path.endsWith('.obj'), {
    message: 'Uploaded file must be a .obj file',
  }),
});

export async function POST(req: NextRequest) {
  try {
    // validate the request body against the schema
    const body = await req.json();
    const parsed = fileUploadSchema.safeParse(body);

    if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

    const { file } = parsed.data;

    // access the uploaded file and move it to a desired location
    const newFilePath = path.join(process.cwd(), 'public/uploads', path.basename(file));
    fs.renameSync(file, newFilePath);

    return NextResponse.json(
      { fileName: path.basename(file) },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }

}
