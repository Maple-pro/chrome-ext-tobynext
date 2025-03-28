import React, { useEffect, useState } from "react"
import fetchSubFolder from "../utils/fetchSubFolder";
import getBookmarkById from "../utils/getBookmarkById";


type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode;

interface MoveCollectionModalProps {
    isOpen: boolean,
    onClose: (e: React.MouseEvent) => void,
    collection: BookmarkTreeNode,
    rootFolder: BookmarkTreeNode,
    getCurrentWorkspace: Function,
    getCurrentSpace: Function,
}

const MoveCollectionModal: React.FC<MoveCollectionModalProps> = ({ isOpen, onClose, collection, rootFolder, getCurrentWorkspace, getCurrentSpace }) => {
    const [selectedWorkspace, setSelectedWorkspace] = useState<BookmarkTreeNode| null>(null);
    const [selectedSpace, setSelectedSpace] = useState<BookmarkTreeNode | null>(null);
    const [workspaces, setWorkspaces] = useState<BookmarkTreeNode[]>([]);
    const [spaces, setSpaces] = useState<BookmarkTreeNode[]>([]);
    const DEFAULT_OPTION_VALUE = "DEFAULT";

    // get workspaces
    useEffect(() => {
        fetchSubFolder(rootFolder, setWorkspaces);
    }, [rootFolder]);

    // get spaces
    useEffect(() => {
        if (selectedWorkspace) {
            fetchSubFolder(selectedWorkspace, setSpaces);
        } else {
            setSpaces([]);
        }
    }, [selectedWorkspace])

    const handleMove = (e: React.MouseEvent) => {
        if (selectedSpace) {
            chrome.bookmarks.move(collection.id, { parentId: selectedSpace.id, index: 0 }, () => {
                onClose(e);
                getCurrentWorkspace(selectedWorkspace);
                getCurrentSpace(selectedSpace);
            })
        }
    };

    const handleClose = (e: React.MouseEvent) => {
        onClose(e);
        setSelectedWorkspace(null);
        setSelectedSpace(null);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]">
            <div className="absolute top-100 left-1/2 -translate-x-1/2 bg-toby-bg-gray opacity-100 rounded-md shadow-md px-24 py-12 flex flex-col items-start justify-between w-500">
                <h2 className="text-[18px] font-bold mb-15">
                    Move {collection.title} Collection to
                </h2>
                
                {/* Workspace selector */}
                <div className="mb-15 w-full">
                    <label className="block text-[14px] mb-10">Workspace</label>
                    <select 
                        value={selectedWorkspace?.id || DEFAULT_OPTION_VALUE}
                        onChange={(e) => {
                            setSelectedWorkspace(getBookmarkById(e.target.value, workspaces));
                            setSelectedSpace(null);
                        }}
                        className="w-full p-4 border rounded text-[14px] h-35"
                    >
                        <option value={DEFAULT_OPTION_VALUE} disabled>Select a workspace</option>
                        {workspaces.map((workspace) => (
                            <option key={workspace.id} value={workspace.id}>{workspace.title}</option>
                        ))}
                    </select>
                </div>

                {/* Space selector */}
                <div className="mb-15 w-full">
                    <label className="block text-[14px] mb-10">Space</label>
                    <select 
                        value={selectedSpace?.id || DEFAULT_OPTION_VALUE}
                        onChange={(e) => setSelectedSpace(getBookmarkById(e.target.value, spaces))}
                        className="w-full p-4 border rounded text-[14px] h-35"
                        disabled={!selectedWorkspace}
                    >
                        <option value={DEFAULT_OPTION_VALUE} disabled>Select a space</option>
                        {spaces.map((space) => (
                            <option key={space.id} value={space.id}>{space.title}</option>
                        ))}
                    </select>
                </div>

                {/* buttons */}
                <div className="w-full flex justify-between items-center space-x-4">
                    <button onClick={handleClose} className="basis-1/2 mx-10 px-10 py-5 rounded-md cursor-pointer text-toby-blue font-bold">Cancel</button>
                    <button 
                        onClick={handleMove} 
                        className={`basis-1/2 mx-10 px-10 py-5 rounded ${selectedSpace ? "bg-toby-blue text-toby-bg-gray" : "text-gray-300 cursor-not-allowed outline-gray-300"}`}
                        disabled={!selectedSpace}
                    >
                        Move
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MoveCollectionModal;