import React, { useEffect } from 'react';

export const UserComponent: React.FC<{ name: string }> = ({ name }) => {
    useEffect(() => {
        console.log("Component mounted for:", name);
    }, [name]);

    const handleClick = () => {
        console.log("Button clicked");
    };

    return (
        <div onClick={handleClick}>
            <h1>Hello {name}</h1>
        </div>
    );
};
