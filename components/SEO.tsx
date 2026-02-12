import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
    type?: string;
}

const BASE_URL = 'https://zayatarot.com';
const DEFAULT_TITLE = 'Zaya Tarot - Tiragem de Tarot Online Grátis | Leitura de Cartas';
const DEFAULT_DESCRIPTION = 'Descubra seu destino com tiragem de tarot online grátis. Leitura de cartas profissional com interpretações detalhadas. Tarot do amor, carreira e orientação espiritual.';
const DEFAULT_IMAGE = 'https://www.sacred-texts.com/tarot/pkt/img/ar00.jpg';

export const SEO: React.FC<SEOProps> = ({
    title,
    description = DEFAULT_DESCRIPTION,
    path = '/',
    image = DEFAULT_IMAGE,
    type = 'website',
}) => {
    const fullTitle = title ? `${title} | Zaya Tarot` : DEFAULT_TITLE;
    const url = `${BASE_URL}${path}`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:locale" content="pt_BR" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};
