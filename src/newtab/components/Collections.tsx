import React, { JSX } from "react";
import Collection from "./Collection";
import { useNewTabContext } from "../context/NewTabContext";


const Collections = (): JSX.Element => {
    const {collections} = useNewTabContext();

    return (
        <div id="collection-panel" className="w-full grow-0 flex flex-col overflow-y-auto">
            {collections.map(collection => (
                <Collection collection={collection} />
            ))}
        </div>
    );
}

export default Collections;