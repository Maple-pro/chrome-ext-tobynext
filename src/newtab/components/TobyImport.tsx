import React, { JSX, useState } from "react";
import importIcon from "@assets/import.svg";
import IconButton from "./IconButton";
import FileUploadModal from "../modals/FileUploadModal";


const TobyImport = (): JSX.Element => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return <>
      <IconButton icon={importIcon} label='Import from Toby' onClick={() => setIsModalOpen(true)} />
      {isModalOpen && <FileUploadModal onClose={() => setIsModalOpen(false)} />}
    </>;
}
export default TobyImport;
