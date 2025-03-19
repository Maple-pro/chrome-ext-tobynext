import React, { JSX } from "react";

interface WorkspaceNameProps {
    workspaceName: String,
}

const WorkspaceName = (props: WorkspaceNameProps): JSX.Element => {
    return (
        <div id="workspace-name-container" className="w-full h-50 flex items-center justify-start pl-12 text-[18px] border-b-1 border-solid border-#DDDDF5">
            {props.workspaceName}
        </div>
    );
}

export default WorkspaceName;