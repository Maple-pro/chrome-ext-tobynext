import React, { JSX } from "react";
import addBlue from "@assets/add-blue.svg";


const Spaces = (): JSX.Element => {
    return (
        <div id="space-container" className="flex flex-col px-12 pt-16">
            <div id="space-title-container" className="flex flex-row justify-between">
                <div id="title" className="text-[12px]">
                    SPACES
                </div>
                <div id="add-space">
                    <img src={addBlue} className="w-15 h-15" />
                </div>
            </div>

        </div>
    );
}

export default Spaces;