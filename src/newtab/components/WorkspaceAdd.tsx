import React, { JSX } from "react";
import addIcon from "@assets/add.svg";


const WorkspaceAdd = (): JSX.Element => {
    return (
        <div id="add-btns-container" className="mt-20 flex justify-center items-center">
            <img src={addIcon} className="w-24 h-24" />
        </div>
    );
}

export default WorkspaceAdd;