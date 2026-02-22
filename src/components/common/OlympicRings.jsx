import React from 'react';

const RING_COLORS = ['#0085C7', '#000000', '#DF0024', '#F4C300', '#009F3D'];
const RING_POSITIONS = [
    { cx: 20, cy: 18 },
    { cx: 55, cy: 18 },
    { cx: 90, cy: 18 },
    { cx: 37.5, cy: 34 },
    { cx: 72.5, cy: 34 },
];

const OlympicRings = ({ active, width = 48, height = 22 }) => (
    <svg width={width} height={height} viewBox="0 0 110 50" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        {RING_POSITIONS.map((pos, i) => (
            <circle
                key={i}
                cx={pos.cx}
                cy={pos.cy}
                r="16"
                fill="none"
                stroke={active ? RING_COLORS[i] : 'currentColor'}
                strokeWidth="5"
            />
        ))}
    </svg>
);

export default OlympicRings;
