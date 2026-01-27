export const MinimalStarsBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ willChange: 'transform' }}>
            <div className="absolute w-0.5 h-0.5 bg-white/40 rounded-full" style={{ top: '12%', left: '15%' }} />
            <div className="absolute w-0.5 h-0.5 bg-white/35 rounded-full" style={{ top: '8%', left: '68%' }} />
            <div className="absolute w-0.5 h-0.5 bg-white/45 rounded-full" style={{ top: '25%', left: '42%' }} />
            <div className="absolute w-0.5 h-0.5 bg-white/30 rounded-full" style={{ top: '35%', left: '82%' }} />
            <div className="absolute w-0.5 h-0.5 bg-white/38 rounded-full" style={{ top: '48%', left: '22%' }} />
            <div className="absolute w-0.5 h-0.5 bg-white/42 rounded-full" style={{ top: '62%', left: '58%' }} />
            <div className="absolute w-0.5 h-0.5 bg-white/32 rounded-full" style={{ top: '75%', left: '35%' }} />
            <div className="absolute w-0.5 h-0.5 bg-white/36 rounded-full" style={{ top: '88%', left: '72%' }} />
        </div>
    );
};
