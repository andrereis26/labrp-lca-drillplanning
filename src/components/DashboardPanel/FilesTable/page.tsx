"use client";

import config from '@/config/config';
import { File } from '@/models/File';
import { useRouter } from 'next/navigation'

interface FileTableProps {
    files: File[];
    selectedFiles: string[];
    setSelectedFiles: React.Dispatch<React.SetStateAction<string[]>>;
}

const FileTable: React.FC<FileTableProps> = ({ files, selectedFiles, setSelectedFiles }) => {
    const router = useRouter();

    // select a single row
    const toggleRow = (name: string) => {
        setSelectedFiles((prevselectedFiles) =>
            prevselectedFiles.includes(name)
                ? prevselectedFiles.filter((rowId) => rowId !== name)
                : [...prevselectedFiles, name]
        );
    };

    // select all rows
    const handleSelectAll = () => {
        const allRowIds = files.map((row) => row.name);
        setSelectedFiles((prevselectedFiles) =>
            prevselectedFiles.length === allRowIds.length ? [] : allRowIds
        );
    };

    // visualize file
    const handleVisualize = (file: File) => {
        // redirect to model viewer page
        router.push(`${config.pageRoutes.modelViewer}${file.name}`);
    };

    return (


        <div className="flex items-center justify-between mt-4">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <div className="pb-4 bg-white dark:bg-gray-900 pt-4 pl-2">
                    <label className="sr-only">Search</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="text" className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for files" />
                    </div>
                </div>
                <table className="w-full text-sm text-left rtl:text-right text-gray-800 dark:text-gray-300">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="p-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={selectedFiles.length === files.length}
                                        onChange={handleSelectAll}
                                    />
                                    <label className="sr-only">checkbox</label>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                File Name
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Options
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {files?.map((file, index) => (
                            <tr className={
                                selectedFiles.includes(file.name)
                                    ? 'cursor-pointer dark:bg-gray-600 bg-blue-200 border-b dark:border-gray-700'
                                    : 'cursor-pointer bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }
                                key={index}>
                                <td className="w-4 p-4">
                                    <div className="flex items-center">
                                        <input
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                            type="checkbox"
                                            checked={selectedFiles.includes(file.name)}
                                            onChange={() => toggleRow(file.name)}
                                        />
                                    </div>
                                </td>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" onClick={() => handleVisualize(file)}>
                                    {file.name}
                                </th>
                                <td className="px-6 py-4">
                                    <span className="font-medium text-blue-600 dark:text-blue-500 hover:underline" rel="noopener noreferrer" onClick={() => handleVisualize(file)}>Visualize</span>
                                    <a href={file.downloadURL} target="_blank" className="pl-2 font-medium text-blue-600 dark:text-blue-500 hover:underline" rel="noopener noreferrer">Download</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>


    );
};

export default FileTable;
