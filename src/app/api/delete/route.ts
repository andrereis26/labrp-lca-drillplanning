import { NextRequest, NextResponse } from 'next/server';
import { storage } from "@/lib/firebaseAdmin";

// delete file from server
export async function DELETE(req: NextRequest) {
    try {
        const { models } = await req.json();

        if (!Array.isArray(models) || !models.every(model => typeof model === 'string')) {
            return NextResponse.json(
                { message: "Invalid input" },
                { status: 400 }
            );
        }

        // delete files from Firebase Storage
        const deletePromises = models.map(model => storage.bucket().file(model).delete());

        const results = await Promise.allSettled(deletePromises);

        const errors = results
            .filter(result => result.status === 'rejected')
            .map((result, index) => ({ model: models[index], error: result.status }));

        if (errors.length > 0) {
            console.error('Failed to delete some files:', errors);
            return NextResponse.json(
                { message: "Some files failed to delete", errors },
                { status: 200 }
            );
        }

        return NextResponse.json({ status: "success" });
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
