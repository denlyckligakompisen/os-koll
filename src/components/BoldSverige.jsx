import React from 'react';

const BoldSverige = ({ text }) => {
    if (!text) return null;
    if (!text.includes('Sverige')) return text;
    const [before, after] = text.split('Sverige');
    return (
        <>
            {before}
            <span style={{ }}>Sverige</span>
            {after}
        </>
    );
};

export default BoldSverige;
