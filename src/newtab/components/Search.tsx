import React, { JSX } from "react";
import searchIcon from "@assets/search.svg";


const Search = (): JSX.Element => {
    return (
        <div id="search-container" className="flex-none w-full h-50 flex items-center justify-start text-[14px] pl-12 pt-20 pb-20 border-b-1 border-solid border-[#DDDDF5]">
            <div id="search-icon" className="mr-10">
                <img src={searchIcon} className="w-15 h-15" />
            </div>
            <div id="search-text">
                Search
            </div>

        </div>

    );
}

export default Search;