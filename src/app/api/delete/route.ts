
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import config from '@/config/config';

// delete file from server
export async function DELETE(req: NextRequest) {
    try {
        const { modelName } = await req.json();

        // create a new file path
        const filePath = `${config.uploads.folderToUpload}${modelName}`;

        // delete the file
        fs.unlinkSync(filePath);
        // console.log(`File ${modelName} deleted`);

        return NextResponse.json({ status: "success" });
    }
    catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

