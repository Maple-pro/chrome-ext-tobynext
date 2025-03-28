import React, { JSX } from "react";


const TabName = (): JSX.Element => {
    return (
        <div id="tab-name-panel" className="w-full h-50 flex-none flex items-center justify-end px-15 border-b-1 border-solid border-toby-outline-gray">
            <div id="tab-name" className="text-[12px] font-bold">
                OPEN TABS
            </div>
        </div>
    );
}

export default TabName;