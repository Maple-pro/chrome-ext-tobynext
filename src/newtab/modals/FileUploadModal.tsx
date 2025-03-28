import React, { useState } from "react";
import { useNewTabContext } from "../context/NewTabContext";

interface FileUploadModalProps {
    onClose: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const {currentWorkspace, refreshSpaces, refreshCollections, setCurrentSpace} = useNewTabContext();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleFileRead(selectedFile);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setDragging(false);
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            handleFileRead(droppedFile);
        }
    };

    const handleFileRead = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const jsonData = JSON.parse(content);
                importBookmarks(jsonData);
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        };
        reader.readAsText(file);
    };

    const importBookmarks = async (data: any) => {
        if (!currentWorkspace) {
            return;
        }

        if (data.version !== 3 || !Array.isArray(data.lists)) {
            console.error("Invalid JSON format");
            return;
        }

        setLoading(true);

        const defaultSpace = await chrome.bookmarks.create({
            title: "Toby Space",
            parentId: currentWorkspace.id,
            index: 0,
        })

        try {
            let num = 0;
            for (const list of data.lists) {
                const folder = await chrome.bookmarks.create({ 
                    title: list.title,
                    parentId: defaultSpace.id,
                });
                for (const card of list.cards) {
                    if (!(card.url as string).startsWith("http")) {
                        continue;
                    }
                    await chrome.bookmarks.create({
                        parentId: folder.id,
                        title: card.title,
                        url: card.url,
                    });
                }
                num++;
                console.log("Import collection num: ", num);
            }
            alert("Bookmarks imported successfully!");
            onClose();
        } catch (error) {
            console.error("Error importing bookmarks: ", error);
        } finally {
            setLoading(false);
            refreshSpaces();
            refreshCollections();
            setCurrentSpace(defaultSpace);
        }

    };

    return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]">
            <div className="absolute top-100 left-1/2 -translate-x-1/2 bg-toby-bg-gray rounded-md shadow-md px-24 py-12 flex flex-col items-start justify-between w-300">
                <h2 className="text-[18px] font-bold mb-15">Import Bookmarks</h2>
                {loading ? (
                    <div className="mx-auto flex justify-center items-center">
                        <svg className="animate-spin h-20 w-20 text-toby-blue" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                    </div>
                ) : (
                    <div 
                        className={`border-2 border-dashed p-6 text-center text-[14px] ${dragging ? "border-toby-blue" : "border-toby-outline-gray"}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {file ? (
                            <p>{file.name}</p>
                        ) : (
                            <p>Drag & Drop Toby exported JSON file here</p>
                        )}
                        <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
                    </div>

                )}
                <div className="flex-none flex justify-center items-center mt-10 mx-auto w-1/2 h-30">
                    <button className="px-4 py-2 rounded-md font-bold cursor-pointer text-toby-blue" onClick={onClose}>CANCEL</button>
                </div>
            </div>
        </div>
    );
};

export default FileUploadModal;
