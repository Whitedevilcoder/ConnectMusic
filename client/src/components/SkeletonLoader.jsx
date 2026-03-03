import React from 'react';

const SkeletonLoader = ({ count = 6 }) => {
    // A simple shimmering CSS animation
    const shimmerStyle = {
        background: 'linear-gradient(90deg, #181818 25%, #222 50%, #181818 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '10px',
        height: '200px', // Matches your card height
        border: '1px solid #333'
    };

    return (
        <>
            <style>
                {`
                    @keyframes shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}
            </style>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {Array(count).fill(0).map((_, i) => (
                    <div key={i} style={shimmerStyle}></div>
                ))}
            </div>
        </>
    );
};

export default SkeletonLoader;