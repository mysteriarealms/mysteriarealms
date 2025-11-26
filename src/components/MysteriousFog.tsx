const MysteriousFog = () => {
  return (
    <>
      {/* Animated fog layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Fog Layer 1 - Slow moving */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, hsl(var(--primary) / 0.15) 0%, transparent 40%)',
            animation: 'fog-drift-1 20s ease-in-out infinite',
          }}
        />
        
        {/* Fog Layer 2 - Medium speed */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 80% 60%, hsl(var(--accent) / 0.12) 0%, transparent 40%)',
            animation: 'fog-drift-2 25s ease-in-out infinite',
          }}
        />
        
        {/* Fog Layer 3 - Fast moving */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: 'radial-gradient(ellipse at 50% 80%, hsl(var(--primary) / 0.1) 0%, transparent 35%)',
            animation: 'fog-drift-3 15s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes fog-drift-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -20px) scale(1.1);
          }
        }

        @keyframes fog-drift-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-40px, 30px) scale(1.15);
          }
        }

        @keyframes fog-drift-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, 40px) scale(1.08);
          }
        }
      `}</style>
    </>
  );
};

export default MysteriousFog;
