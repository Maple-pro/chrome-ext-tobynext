import React, { JSX, useState } from "react";
import importIcon from "@assets/import.svg";
import FileUploadModal from "../modals/FileUploadModal";


const TobyImport = (): JSX.Element => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div id="import-btn-container" className="mt-auto flex justify-center items-center">
            <img 
                src={importIcon} 
                onClick={() => setIsModalOpen(true)}
                className="w-30 h-30 cursor-pointer" 
            />
            {isModalOpen && <FileUploadModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
}

export default TobyImport;