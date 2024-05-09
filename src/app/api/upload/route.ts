import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import { Readable, pipeline } from 'stream';
import { promisify } from 'util';
const pump = promisify(pipeline);
import { v4 as uuidv4 } from "uuid";
import config from "@/config/config";
import { storage } from "@/lib/firebaseAdmin";

// upload file to server
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
    if (!config.uploads.models.type.includes(fileExtension)) {
      return NextResponse.json(
        { message: "Invalid file extension" },
        { status: 400 }
      );
    }

    let arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);

    // create a new file name
    const fileName = `${uuidv4()}.obj`;

    // create a new file path
    const filePath = `${config.uploads.folderToUpload}${fileName}`;

    // create a readable stream from the file buffer
    const readStream = Readable.from(buffer);

    // upload file to Firebase Storage
    const fileStream = storage.bucket().file(fileName).createWriteStream();
    fileStream.write(buffer);
    fileStream.end();

    // generate download URL with very distant future expiration time
    const expirationTime = new Date('9999-12-31T23:59:59Z');
    const downloadURL = await storage.bucket().file(fileName).getSignedUrl({
      action: 'read',
      expires: expirationTime
    });

    // create a writable stream to save the file
    const writeStream = fs.createWriteStream(filePath);

    // pipe the read stream to the write stream
    await pump(readStream, writeStream);

    return NextResponse.json({ status: "success", url: downloadURL });

  }
  catch (e) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }

}
