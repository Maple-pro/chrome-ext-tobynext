import React, { JSX, useEffect, useState } from "react";
import addSpaceIcon from "@assets/add-space.svg";
import folderIcon from "@assets/folder.svg";
import selectedFolderIcon from '@assets/folder-selected.svg';
import FolderCreateModal from "../modals/FolderCreateModal";
import { useNewTabContext } from "../context/NewTabContext";


const Spaces = (): JSX.Element => {
    const {spaces} = useNewTabContext();
    const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
    const {currentWorkspace, currentSpace, setCurrentSpace, refreshSpaces} = useNewTabContext();
    const [draggedBookmark, setDraggedBookmark] = useState<BookmarkTreeNode | null>(null);
    const [dragOverBookmark, setDragOverBookmark] = useState<BookmarkTreeNode | null>(null);

    useEffect(() => {
        console.log("current space: " + currentSpace?.title);
    }, [currentSpace]);

    const handleCreateSpace = (title: string) => {
        if (currentWorkspace) {
            chrome.bookmarks.create(
                {
                    title: title,
                    parentId: currentWorkspace.id,
                },
                (newSpace) => {
                    setCurrentSpace(newSpace);
                    refreshSpaces();
                    setIsNewSpaceModalOpen(false);
                }
            );
        }
    };

    const handleDragStart = (bookmark: BookmarkTreeNode) => {
        setDraggedBookmark(bookmark);
    };

    const handleDragOver = (event: React.DragEvent, bookmark: BookmarkTreeNode) => {
        event.preventDefault();
        setDragOverBookmark(bookmark);
    };

    const handleDragEnd = () => {
        setDraggedBookmark(null);
        setDragOverBookmark(null);
    };

    const handleDrop = (targetBookmark: BookmarkTreeNode) => {
        if (draggedBookmark === null || targetBookmark == null || draggedBookmark.index === targetBookmark.index) {
            return;
        }

        chrome.bookmarks.move(draggedBookmark.id, {
            parentId: draggedBookmark.parentId,
            index: targetBookmark.index,
        }, () => {
            refreshSpaces();
        });
    };

    return (
        <div id="space-container" className="flex flex-col px-12 py-16 overflow-y-auto no-scrollbar">
            <div id="space-title-container" className="flex flex-row justify-between">
                <div id="title" className="text-[12px] font-bold">
                    SPACES
                </div>
                <div id="add-space" onClick={() => setIsNewSpaceModalOpen(true)} className="cursor-pointer">
                    <img src={addSpaceIcon} className="w-15 h-15" />
                </div>
            </div>

            <div
                id="spaces-container" 
                className="flex flex-col pt-15 overflow-auto"
            >
                {spaces.map(space => (
                    <div
                        id="space-container"
                        draggable
                        onDragStart={() => handleDragStart(space)}
                        onDragOver={(e) => handleDragOver(e, space)}
                        onDrop={() => handleDrop(space)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setCurrentSpace(space)}
                        className={`w-full h-25 mb-5 flex items-center justify-start cursor-pointer
                            ${draggedBookmark?.id === space.id ? "opacity-50" : ""}
                            ${dragOverBookmark?.id === space.id ? "border-t-1 border-toby-blue" : ""}`}
                    >
                        <div id="space-icon" className="mr-10">
                            <img src={currentSpace && space.id === currentSpace.id ? selectedFolderIcon : folderIcon} className="w-15 h-15" />
                        </div>
                        <div id="space-title" className={`text-[14px] ${currentSpace && space.id === currentSpace.id ? "font-bold text-toby-blue" : ""} `}>
                            {space.title}
                        </div>
                    </div>
                ))}
            </div>

            <FolderCreateModal hint="Create New Space" isOpen={isNewSpaceModalOpen} onClose={() => setIsNewSpaceModalOpen(false)} onCreate={handleCreateSpace} />
        </div>
    );
}

export default Spaces;