import React from 'react';
import OlympicRings from './common/OlympicRings';
import PageHeader from './common/PageHeader';

const Header = ({ style }) => (
    <PageHeader
        title="OS-kollen"
        icon={<OlympicRings active />}
        style={{ paddingTop: '8px', ...style }}
    />
);

export default Header;
