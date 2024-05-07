import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);
import beConfig from "@/config/beConfig";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "Invalid file type" },
        { status: 400 }
      );
    }

    // Check if the file type is allowed
    const fileExtension = file.name.split('.').pop() as string;
    if (!beConfig.uploads.models.type.includes(fileExtension)) {
      return NextResponse.json(
        { message: "Invalid file extension" },
        { status: 400 }
      );
    }

    let arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // create a new file name
    const fileName = `${uuidv4()}.obj`;

    // Create a new file path
    const filePath = `${beConfig.uploads.folder}${fileName}`;

    // Create a readable stream from the file buffer
    const readStream = Readable.from(buffer);

    // Create a writable stream to save the file
    const writeStream = fs.createWriteStream(`${beConfig.uploads.folder}${fileName}`);

    // Pipe the read stream to the write stream
    await pump(readStream, writeStream);

    return NextResponse.json({ status: "success", data: file.size });

  }
  catch (e) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }

}
