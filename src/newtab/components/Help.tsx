import React, { JSX } from "react";
import helpIcon from "@assets/help.svg";


const helpUrl = "https://sites.maples31.com/tobynext/";

const Help = (): JSX.Element => {
    return (
        <div id="import-btn-container" className="mt-auto flex justify-center items-center">
            <img 
                src={helpIcon} 
                onClick={() => window.open(helpUrl, "_blank")}
                className="w-30 h-30 cursor-pointer" 
            />
        </div>
    );
}

export default Help;