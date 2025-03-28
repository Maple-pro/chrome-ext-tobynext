import React, { JSX } from "react";
import { useNewTabContext } from "../context/NewTabContext";


const WorkspaceName = (): JSX.Element => {
    const {currentWorkspace} = useNewTabContext();

    return (
        <div id="workspace-name-container" className="w-full h-50 flex-none flex items-center justify-start pl-12 text-[18px] border-b-1 border-solid border-toby-outline-gray">
            {currentWorkspace?.title || ""}
        </div>
    );
}

export default WorkspaceName;