import React from 'react';

const BoldSverige = ({ text }) => {
    if (!text) return null;
    if (!text.includes('Sverige')) return text;
    const [before, after] = text.split('Sverige');
    return (
        <>
            {before}
            <span style={{ color: '#000', fontWeight: '700' }}>Sverige</span>
            {after}
        </>
    );
};

export default BoldSverige;
