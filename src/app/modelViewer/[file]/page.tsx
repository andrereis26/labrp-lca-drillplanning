import ModelViewer from "@/components/ModelViewer/page";
import config from "@/config/config";
import { File } from "@/models/File";
import { redirect } from 'next/navigation'

// get model URL from server side
async function getData(file: string) {
    try {
        const url = `${config.apiRoutes.base}${config.apiRoutes.routes.files}/${file}`
        const res = await fetch(url);

        if (!res.ok) {
            return null;
        }

        return res.json()
    } catch (error) {
        // console.error("Error:", error)
        return null;
    }

}

const ModelViewerPage = async ({ params }: { params: { file: string } }) => {

    // get model URL from server side
    const { file } = await getData(params.file) as { file: File }

    // if error redirect to home page
    if (!file) {
        redirect('/')
    }

    return (
        <div>
            <ModelViewer modelUrl={file.downloadURL} />
        </div>
    );
}

export default ModelViewerPage;