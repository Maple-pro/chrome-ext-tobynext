import React, { useState } from "react";
import searchIcon from "@assets/search.svg";

interface SearchModalProps {
    isOpen: boolean,
    onClose: (e: React.MouseEvent) => void,
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);

    if (!isOpen) {
        return null;
    }

    // search bookmarks
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.trim() === "") {
            setResults([]);
            return;
        }

        chrome.bookmarks.search(value, (bookmarks) => {
            setResults(bookmarks);
        });
    };

    return (
        <div id="search-modal-bg" className="fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]">
            <div id="search-modal-container" className="absolute top-50 left-1/2 -translate-x-1/2 w-700 max-h-[calc(100vh-100px)] bg-[#FAFAFA] px-16 py-24 shadow-md rounded-md border border-gray-200 flex flex-col">
                <div id="input-container" className="flex-none h-80 flex flex-row justify-center items-center">
                    <div id="search-icon" className="w-30 h-30 mr-10">
                        <img src={searchIcon} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        className="w-full h-32 px-10 text-[20px] leading-[30px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Search bookmarks..."
                    />
                </div>
                <div id="result-container" className="mt-4 w-full max-h-[calc(100vh-250px)] overflow-y-auto">
                    {results.length > 0 ? (
                        results.map((bookmark) => (
                            <div
                                key={bookmark.id}
                                onClick={() => window.open(bookmark.url, "_blank")}
                                className="my-10 px-16 py-10 rounded-md border-1 border-solid border-[#DDDDF5] shadow-sm shadow-[#DDDDF5] cursor-pointer hover:bg-gray-100 flex flex-col"
                            >
                                <div id="bookmark-title" className="w-full text-[14px] truncate">
                                    {bookmark.title}
                                </div>
                                <div id="bookmark-url" className="w-full text-[12px] font-light truncate">
                                    {bookmark.url}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No results found</p>
                    )}
                </div>
                <button
                    onClick={(e) => onClose(e)}
                    className="flex-none mt-4 mx-auto w-1/2 px-4 py-2 h-30 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                    CLOSE
                </button>
            </div>

        </div>
    );
};

export default SearchModal;
