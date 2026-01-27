import React from 'react';

export const StarsBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ willChange: 'transform', zIndex: 1 }}>
            {/* First row of stars */}
            <div className="absolute w-1 h-1 bg-white/70 rounded-full shadow-lg" style={{ top: '5%', left: '8%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/65 rounded-full shadow-lg" style={{ top: '8%', left: '68%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/75 rounded-full shadow-lg" style={{ top: '12%', left: '35%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/68 rounded-full shadow-lg" style={{ top: '3%', left: '85%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/72 rounded-full shadow-lg" style={{ top: '15%', left: '55%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />

            {/* Second row */}
            <div className="absolute w-1 h-1 bg-white/60 rounded-full shadow-lg" style={{ top: '18%', left: '22%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/70 rounded-full shadow-lg" style={{ top: '20%', left: '75%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/65 rounded-full shadow-lg" style={{ top: '25%', left: '42%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/74 rounded-full shadow-lg" style={{ top: '28%', left: '12%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/69 rounded-full shadow-lg" style={{ top: '32%', left: '88%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />

            {/* Third row */}
            <div className="absolute w-1 h-1 bg-white/71 rounded-full shadow-lg" style={{ top: '35%', left: '48%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/66 rounded-full shadow-lg" style={{ top: '38%', left: '65%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/75 rounded-full shadow-lg" style={{ top: '42%', left: '28%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/68 rounded-full shadow-lg" style={{ top: '45%', left: '15%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/63 rounded-full shadow-lg" style={{ top: '48%', left: '78%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />

            {/* Fourth row */}
            <div className="absolute w-1 h-1 bg-white/72 rounded-full shadow-lg" style={{ top: '52%', left: '55%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/67 rounded-full shadow-lg" style={{ top: '55%', left: '35%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/70 rounded-full shadow-lg" style={{ top: '58%', left: '72%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/64 rounded-full shadow-lg" style={{ top: '62%', left: '22%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/76 rounded-full shadow-lg" style={{ top: '65%', left: '8%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />

            {/* Fifth row */}
            <div className="absolute w-1 h-1 bg-white/69 rounded-full shadow-lg" style={{ top: '68%', left: '82%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/73 rounded-full shadow-lg" style={{ top: '72%', left: '45%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/65 rounded-full shadow-lg" style={{ top: '75%', left: '65%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/71 rounded-full shadow-lg" style={{ top: '78%', left: '28%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/68 rounded-full shadow-lg" style={{ top: '82%', left: '18%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />

            {/* Sixth row */}
            <div className="absolute w-1 h-1 bg-white/74 rounded-full shadow-lg" style={{ top: '85%', left: '88%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/66 rounded-full shadow-lg" style={{ top: '88%', left: '55%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/72 rounded-full shadow-lg" style={{ top: '92%', left: '35%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/67 rounded-full shadow-lg" style={{ top: '95%', left: '75%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
            <div className="absolute w-1 h-1 bg-white/70 rounded-full shadow-lg" style={{ top: '98%', left: '12%', boxShadow: '0 0 4px rgba(255,255,255,0.8)' }} />
        </div>
    );
};

export default StarsBackground;
