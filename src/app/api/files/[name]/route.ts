
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

// update file by its name
export async function PUT(req: NextRequest, { params: { name } }: FileParams) {
    try {
        const { drillZones } = await req.json();
        const file = await getFile(name);

        if (!file) {
            return NextResponse.json(
                { message: "File not found" },
                { status: 404 }
            );
        }

        // update file
        await storage.bucket().file(file.name).setMetadata({
            metadata: {
                drillZones: JSON.stringify(drillZones)
            }
        });

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

    // parse drillZones from metadata
    let drillZones =  file[0].metadata.metadata?.drillZones ? JSON.parse(String(file[0].metadata.metadata.drillZones)) : [];
    
    // clean name, remove everything after the - character
    let cleanName = file[0].name.split("-")[0];

    return {
        name: file[0].name,
        cleanName: cleanName,
        downloadURL: downloadURL[0],
        drillZones: drillZones
    };
}