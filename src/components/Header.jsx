import React from 'react';
import OlympicRings from './common/OlympicRings';
import PageHeader from './common/PageHeader';

const Header = () => (
    <PageHeader
        title="OS-kollen"
        icon={<OlympicRings active />}
        style={{ marginBottom: '20px', paddingTop: '8px' }}
    />
);

export default Header;
