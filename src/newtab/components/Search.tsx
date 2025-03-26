import React, { JSX, useState } from "react";
import searchIcon from "@assets/search.svg";
import SearchModal from "./SearchModal";


const Search = (): JSX.Element => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <div 
            id="search-container" 
            onClick={() => {setIsSearchOpen(true)}}
            className="flex-none w-full h-50 flex items-center justify-start text-[14px] pl-12 pt-20 pb-20 border-b-1 border-solid border-[#DDDDF5] cursor-pointer"
        >
            <div id="search-icon" className="mr-10">
                <img src={searchIcon} className="w-15 h-15" />
            </div>
            <div id="search-text">
                Search
            </div>

            {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={(e) => {
                e.stopPropagation();
                setIsSearchOpen(false);
            }} />}
        </div>
    );
}

export default Search;