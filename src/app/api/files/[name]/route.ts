
import config from "@/config/config";
import { storage } from "@/lib/firebaseAdmin";
import { File } from "@/models/File";
import { NextRequest, NextResponse } from "next/server";


interface FileParams {
    params: {
      name: string;
    };
  }

// get file by its name
export async function GET(_: NextRequest, { params: { name } }: FileParams) {
    try {

        const file = await getFile(name);

        if (!file) {
            return NextResponse.json(
                { message: "File not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            file: file
        },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// get file by its name
const getFile = async (name: string): Promise<File | null> => {
    const [file] = await storage.bucket().getFiles({ prefix: name });

    if (file.length === 0) {
        return null;
    }

    const downloadURL = await file[0].getSignedUrl({
        action: 'read',
        expires: config.firebase.expirationTime
    });

    return {
        name: file[0].name,
        downloadURL: downloadURL[0]
    };
}