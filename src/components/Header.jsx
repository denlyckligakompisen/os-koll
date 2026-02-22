
import React from 'react';

const Header = () => (
    <header style={{
        marginBottom: '20px',
        paddingTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
    }}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '2px'
        }}>
            <svg width="48" height="22" viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9, overflow: 'visible' }}>
                <circle cx="20" cy="18" r="16" fill="none" stroke="black" strokeWidth="5" />
                <circle cx="55" cy="18" r="16" fill="none" stroke="black" strokeWidth="5" />
                <circle cx="90" cy="18" r="16" fill="none" stroke="black" strokeWidth="5" />
                <circle cx="37.5" cy="34" r="16" fill="none" stroke="black" strokeWidth="5" />
                <circle cx="72.5" cy="34" r="16" fill="none" stroke="black" strokeWidth="5" />
            </svg>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.04em' }}>OS-kollen</h1>
        </div>
    </header>
);

export default Header;
