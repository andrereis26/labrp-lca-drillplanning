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
    const data = await getData(params.file) 
    const file = data?.file as File ?? null

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