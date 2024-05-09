import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebaseAdmin";
import { File } from "@/models/File";
import config from "@/config/config";

// get all files from Firebase Storage
async function getFiles(): Promise<File[]> {
    const [files] = await storage.bucket().getFiles();

    // get download URL for each file
    const filePromises = files.map(async file => {
        const downloadURL = await file.getSignedUrl({
            action: 'read',
            expires: config.firebase.expirationTime
        });

        return {
            name: file.name,
            downloadURL: downloadURL[0]
        };
    });

    return Promise.all(filePromises);
}

export async function GET(req: NextRequest) {
    try {
        if (req.method === "GET") {
            const files = await getFiles();
            return NextResponse.json({
                files: files
            },
                { status: 200 }
            );
        } else {
            return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
        }
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
