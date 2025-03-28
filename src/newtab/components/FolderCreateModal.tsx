import React from "react";

interface FolderCreateModalProps {
    isOpen: boolean,
    onClose: () => void,
    onCreate: (title: string) => void,
};

const FolderCreateModal: React.FC<FolderCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = React.useState("");

    if (!isOpen) {
        return null;
    }

    const handleCreate = () => {
        if (!title.trim()) {
            return;
        }
        onCreate(title);
        setTitle("");
    }

    return (
        <div id="new-workspace-dialog-mask" className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]">
            <div id="new-workspace-dialog" className="absolute top-100 left-1/2 -translate-x-1/2 bg-toby-bg-gray opacity-100 rounded-md shadow-md px-24 py-12 flex flex-col items-start justify-between w-300">
                <div id="new-workspace-dialog-title" className="text-[18px] font-bold mb-15">
                    Create New Workspace
                </div>
                <div id="new-workspace-dialog-input-hint" className="text-[14px] mb-10">
                    Title
                </div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                    className="w-full text-[14px] border border-gray-300 rounded-md h-25 flex-0 px-4 py-10 focus:outline-none focus:ring-2 focus:ring-toby-blue"
                    placeholder="Enter workspace title"
                />
                <div id="new-workspace-dialog-buttons" className="w-full flex flex-row items-center justify-around mt-15">
                    <div
                        id="new-workspace-dialog-cancel"
                        onClick={onClose}
                        className="flex items-center justify-center basis-1/2 px-10 py-5 mr-5 rounded-md cursor-pointer text-toby-blue font-bold"
                    >
                        CANCEL
                    </div>
                    <div
                        id="new-workspace-dialog-confirm"
                        onClick={handleCreate}
                        className={`flex items-center justify-center basis-1/2 px-10 py-5
                            rounded-md cursor-pointer font-bold outline-1
                            ${title? "bg-toby-blue text-toby-bg-gray outline-0" : "text-gray-300 outline-gray-300"}  `}
                    >
                        CREATE
                    </div>
                </div>
            </div>
        </div>

    )
}

export default FolderCreateModal;