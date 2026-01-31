import React from 'react';

const ArquivoArcano: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1a1628] via-[#0d0512] to-[#000000] p-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Crimson Text, serif' }}>
                Arquivo dos Arcanos
            </h1>
            <p className="text-lg text-violet-100 mb-8 max-w-2xl text-center" style={{ fontFamily: 'Crimson Text, serif' }}>
                Aqui você encontrará informações detalhadas sobre todos os 22 Arcanos Maiores do Tarot. Em breve, conteúdo completo!
            </p>
            {/* Adicione aqui o conteúdo do arquivo dos arcanos */}
        </div>
    );
};

export default ArquivoArcano;
