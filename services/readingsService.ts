// Service para salvar leituras no Supabase
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TarotCard } from '../types';
import { TAROT_CARDS } from '../tarotData';

/**
 * Encontra a imagem de uma carta pelo nome (português ou inglês)
 * Usa fuzzy matching para lidar com variações de entrada do usuário
 */
const findCardImageByName = (cardName: string): string => {
    if (!cardName) return '';

    const normalizedName = cardName.toLowerCase().trim();

    // Busca exata primeiro (nome em inglês ou português)
    const exactMatch = TAROT_CARDS.find(card =>
        card.name.toLowerCase() === normalizedName ||
        card.name_pt.toLowerCase() === normalizedName
    );

    if (exactMatch) return exactMatch.imageUrl;

    // Busca parcial (contém o nome)
    const partialMatch = TAROT_CARDS.find(card =>
        card.name.toLowerCase().includes(normalizedName) ||
        card.name_pt.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(card.name.toLowerCase()) ||
        normalizedName.includes(card.name_pt.toLowerCase())
    );

    if (partialMatch) return partialMatch.imageUrl;

    // Busca por palavras-chave (ex: "louco" encontra "O Louco")
    const keywordMatch = TAROT_CARDS.find(card => {
        const nameParts = card.name_pt.toLowerCase().split(' ');
        const inputParts = normalizedName.split(' ');
        return nameParts.some(part => inputParts.includes(part) && part.length > 2) ||
               inputParts.some(part => nameParts.includes(part) && part.length > 2);
    });

    return keywordMatch?.imageUrl || '';
};

export interface SavedReading {
    user_id: string;
    spread_type: string;
    cards: TarotCard[];
    question?: string;
    synthesis?: string;
    rating?: number;
    notes?: string;
}

// Interface para resumo estruturado
export interface ReadingSummary {
    pergunta?: string;
    tema_central?: string;
    sintese?: string;
    conselho?: string;
    reflexao?: string;
    resposta?: string; // Para sim/não
    energia?: string;
    desafio?: string;
    ponto_atencao?: string;
}

/**
 * Formata o resumo da leitura para salvar no histórico
 * Cria um texto estruturado e legível
 */
export const formatReadingSummary = (
    summary: ReadingSummary,
    spreadType: string,
    isPortuguese: boolean = true
): string => {
    const parts: string[] = [];

    // Título baseado no tipo de spread
    const spreadTitles: Record<string, { pt: string; en: string }> = {
        'three_card': { pt: 'Três Cartas', en: 'Three Cards' },
        'celtic_cross': { pt: 'Cruz Celta', en: 'Celtic Cross' },
        'love_check': { pt: 'Amor e Relacionamento', en: 'Love & Relationship' },
        'yes_no': { pt: 'Sim ou Não', en: 'Yes or No' },
        'card_of_day': { pt: 'Carta do Dia', en: 'Daily Card' }
    };

    const title = spreadTitles[spreadType]?.[isPortuguese ? 'pt' : 'en'] || spreadType;

    // Pergunta do usuário (se houver)
    if (summary.pergunta?.trim()) {
        parts.push(`${isPortuguese ? 'PERGUNTA' : 'QUESTION'}: "${summary.pergunta}"`);
    }

    // Para Sim/Não, mostrar resposta primeiro
    if (summary.resposta && spreadType === 'yes_no') {
        const respostaMap: Record<string, { pt: string; en: string }> = {
            'sim': { pt: 'SIM', en: 'YES' },
            'nao': { pt: 'NÃO', en: 'NO' },
            'talvez': { pt: 'TALVEZ', en: 'MAYBE' }
        };
        const resp = respostaMap[summary.resposta]?.[isPortuguese ? 'pt' : 'en'] || summary.resposta;
        parts.push(`${isPortuguese ? 'RESPOSTA' : 'ANSWER'}: ${resp}`);
    }

    // Tema central
    if (summary.tema_central) {
        parts.push(`${isPortuguese ? 'TEMA' : 'THEME'}: ${summary.tema_central}`);
    }

    // Energia (para carta do dia)
    if (summary.energia) {
        parts.push(`${isPortuguese ? 'ENERGIA' : 'ENERGY'}: ${summary.energia}`);
    }

    // Síntese principal
    if (summary.sintese) {
        parts.push(`\n${summary.sintese}`);
    }

    // Desafio (Cruz Celta)
    if (summary.desafio) {
        parts.push(`${isPortuguese ? 'DESAFIO' : 'CHALLENGE'}: ${summary.desafio}`);
    }

    // Ponto de atenção (Amor)
    if (summary.ponto_atencao) {
        parts.push(`${isPortuguese ? 'ATENÇÃO' : 'ATTENTION'}: ${summary.ponto_atencao}`);
    }

    // Conselho
    if (summary.conselho) {
        parts.push(`${isPortuguese ? 'CONSELHO' : 'ADVICE'}: ${summary.conselho}`);
    }

    // Reflexão
    if (summary.reflexao) {
        parts.push(`${isPortuguese ? 'REFLEXÃO' : 'REFLECTION'}: ${summary.reflexao}`);
    }

    return parts.join('\n');
};

/**
 * Extrai resumo estruturado da síntese da IA
 * Funciona com qualquer tipo de spread
 */
export const extractSummaryFromSynthesis = (
    synthesis: any,
    question?: string
): ReadingSummary => {
    if (!synthesis) return { pergunta: question };

    return {
        pergunta: question,
        tema_central: synthesis.tema_central || synthesis.energia || undefined,
        sintese: synthesis.sintese || synthesis.mensagem || synthesis.explicacao || undefined,
        conselho: synthesis.conselho || synthesis.foco || undefined,
        reflexao: synthesis.reflexao || synthesis.pergunta_reflexiva || undefined,
        resposta: synthesis.resposta || undefined,
        energia: synthesis.energia || undefined,
        desafio: synthesis.desafio_principal || undefined,
        ponto_atencao: synthesis.ponto_atencao || synthesis.condicao || undefined
    };
};

/**
 * Salva uma leitura no Supabase database
 * Retorna true se foi salvo com sucesso, false caso contrário
 */
export const saveReadingToSupabase = async (
    userId: string,
    spreadType: string,
    cards: TarotCard[],
    question?: string,
    synthesis?: string,
    rating?: number,
    notes?: string
): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        // Supabase not configured
        return false;
    }

    try {
        const { error } = await supabase
            .from('readings')
            .insert([
                {
                    user_id: userId,
                    spread_type: spreadType,
                    cards: cards.map(c => ({
                        id: c.id,
                        name: c.name,
                        arcana: c.arcana,
                        suit: c.suit,
                        imageUrl: c.imageUrl
                    })),
                    question: question || null,
                    synthesis: synthesis || null,
                    rating: rating || null,
                    notes: notes || null,
                }
            ]);

        if (error) {
            // Error saving reading
            return false;
        }

                return true;
    } catch (err) {
        // Exception saving reading
        return false;
    }
};

/**
 * Salva leitura com resumo estruturado
 * Versão otimizada que formata automaticamente a síntese
 */
export const saveReadingWithSummary = async (
    userId: string,
    spreadType: string,
    cards: TarotCard[],
    rawSynthesis: any,
    question?: string,
    isPortuguese: boolean = true
): Promise<boolean> => {
    // Extrair resumo estruturado
    const summary = extractSummaryFromSynthesis(rawSynthesis, question);

    // Formatar para texto legível
    const formattedSynthesis = formatReadingSummary(summary, spreadType, isPortuguese);

    // Salvar com todos os dados
    return saveReadingToSupabase(
        userId,
        spreadType,
        cards,
        question,
        formattedSynthesis,
        0,
        summary.tema_central || summary.energia || ''
    );
};

/**
 * Mapeamento de tipos de spread para informações de exibição
 */
const getSpreadDisplayInfo = (spreadType: string, isPortuguese: boolean = true) => {
    const spreadNameMap: Record<string, { name: string; tag: string; color: string; positions: string[] }> = {
        'card_of_day': {
            name: isPortuguese ? 'Carta do Dia' : 'Card of the Day',
            tag: isPortuguese ? 'DIÁRIA' : 'DAILY',
            color: 'text-yellow-400 bg-yellow-500/10',
            positions: [isPortuguese ? 'Energia do Dia' : "Today's Energy"]
        },
        'yes_no': {
            name: isPortuguese ? 'Sim ou Não' : 'Yes or No',
            tag: isPortuguese ? 'RÁPIDA' : 'QUICK',
            color: 'text-blue-400 bg-blue-500/10',
            positions: [isPortuguese ? 'Resposta' : 'Answer']
        },
        'three_card': {
            name: isPortuguese ? 'Três Cartas' : 'Three Cards',
            tag: isPortuguese ? 'PADRÃO' : 'STANDARD',
            color: 'text-primary bg-primary/10',
            positions: isPortuguese
                ? ['O Passado', 'O Presente', 'O Futuro']
                : ['The Past', 'The Present', 'The Future']
        },
        'love_check': {
            name: isPortuguese ? 'Amor e Relacionamento' : 'Love & Relationship',
            tag: isPortuguese ? 'AMOR' : 'LOVE',
            color: 'text-pink-400 bg-pink-500/10',
            positions: isPortuguese
                ? ['Você', 'A Outra Pessoa', 'Relacionamento', 'Desafio', 'Conselho']
                : ['You', 'Them', 'Relationship', 'Challenge', 'Advice']
        },
        'celtic_cross': {
            name: isPortuguese ? 'Cruz Celta' : 'Celtic Cross',
            tag: isPortuguese ? 'COMPLETA' : 'FULL',
            color: 'text-green-400 bg-green-500/10',
            positions: isPortuguese
                ? ['O Significador', 'O Cruzamento', 'A Base', 'Passado Recente', 'A Coroa',
                   'Futuro Próximo', 'O Eu', 'O Ambiente', 'Esperanças e Medos', 'O Resultado']
                : ['The Significator', 'The Crossing', 'The Foundation', 'The Recent Past', 'The Crown',
                   'The Near Future', 'The Self', 'The Environment', 'Hopes & Fears', 'The Outcome']
        },
        // Physical reading types
        'physical_yes_no': {
            name: isPortuguese ? 'Tiragem Física - Sim ou Não' : 'Physical Reading - Yes or No',
            tag: isPortuguese ? 'FÍSICA' : 'PHYSICAL',
            color: 'text-amber-400 bg-amber-500/10',
            positions: [isPortuguese ? 'Resposta' : 'Answer']
        },
        'physical_three_card': {
            name: isPortuguese ? 'Tiragem Física - Três Cartas' : 'Physical Reading - Three Cards',
            tag: isPortuguese ? 'FÍSICA' : 'PHYSICAL',
            color: 'text-amber-400 bg-amber-500/10',
            positions: isPortuguese
                ? ['Passado', 'Presente', 'Futuro']
                : ['Past', 'Present', 'Future']
        },
        'physical_five_card': {
            name: isPortuguese ? 'Tiragem Física - Cruz Simples' : 'Physical Reading - Simple Cross',
            tag: isPortuguese ? 'FÍSICA' : 'PHYSICAL',
            color: 'text-amber-400 bg-amber-500/10',
            positions: isPortuguese
                ? ['Centro', 'Cruzamento', 'Passado', 'Futuro', 'Resultado']
                : ['Center', 'Crossing', 'Past', 'Future', 'Outcome']
        },
        'physical_seven_card': {
            name: isPortuguese ? 'Tiragem Física - Sete Cartas' : 'Physical Reading - Seven Cards',
            tag: isPortuguese ? 'FÍSICA' : 'PHYSICAL',
            color: 'text-amber-400 bg-amber-500/10',
            positions: isPortuguese
                ? ['Passado', 'Presente', 'Futuro', 'Conselho', 'Ambiente', 'Esperanças', 'Resultado']
                : ['Past', 'Present', 'Future', 'Advice', 'Environment', 'Hopes', 'Outcome']
        },
        'physical_celtic_cross': {
            name: isPortuguese ? 'Tiragem Física - Cruz Celta' : 'Physical Reading - Celtic Cross',
            tag: isPortuguese ? 'FÍSICA' : 'PHYSICAL',
            color: 'text-amber-400 bg-amber-500/10',
            positions: isPortuguese
                ? ['Significador', 'Cruzamento', 'Base', 'Passado', 'Coroa', 'Futuro', 'Eu', 'Ambiente', 'Esperanças/Medos', 'Resultado']
                : ['Significator', 'Crossing', 'Foundation', 'Past', 'Crown', 'Future', 'Self', 'Environment', 'Hopes/Fears', 'Outcome']
        },
        'physical_custom': {
            name: isPortuguese ? 'Tiragem Física - Personalizada' : 'Physical Reading - Custom',
            tag: isPortuguese ? 'FÍSICA' : 'PHYSICAL',
            color: 'text-amber-400 bg-amber-500/10',
            positions: []
        }
    };

    // Check if it's a physical reading with unknown type
    if (spreadType.startsWith('physical_') && !spreadNameMap[spreadType]) {
        return {
            name: isPortuguese ? 'Tiragem Física' : 'Physical Reading',
            tag: isPortuguese ? 'FÍSICA' : 'PHYSICAL',
            color: 'text-amber-400 bg-amber-500/10',
            positions: []
        };
    }

    return spreadNameMap[spreadType] || {
        name: spreadType,
        tag: isPortuguese ? 'OUTRO' : 'OTHER',
        color: 'text-gray-400 bg-gray-500/10',
        positions: []
    };
};

/**
 * Transforma um registro do Supabase para o formato esperado pelos componentes
 */
export const transformSupabaseReading = (reading: any, isPortuguese: boolean = true) => {
    const spreadInfo = getSpreadDisplayInfo(reading.spread_type, isPortuguese);
    const cards = reading.cards || [];

    // Formatar a data
    const createdAt = new Date(reading.created_at);
    const formattedDate = createdAt.toLocaleString(isPortuguese ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    return {
        id: reading.id,
        date: formattedDate,
        spreadName: spreadInfo.name,
        typeBadge: spreadInfo.tag,
        typeColor: spreadInfo.color,
        spreadId: reading.spread_type,
        previewCards: cards.map((c: any) => c.imageUrl),
        cardNames: cards.map((c: any) => c.name),
        positions: spreadInfo.positions.slice(0, cards.length),
        notes: reading.synthesis || reading.notes || '',
        comment: reading.notes || '',
        rating: reading.rating || 0
    };
};

/**
 * Busca histórico de leituras do Supabase e transforma para o formato de exibição
 */
export const fetchReadingsFromSupabase = async (userId: string, limit: number = 20, isPortuguese: boolean = true) => {
    if (!isSupabaseConfigured()) {
        // Supabase not configured
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('readings')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            // Error fetching readings
            return [];
        }

        // Transformar cada registro para o formato esperado pelos componentes
        return (data || []).map(reading => transformSupabaseReading(reading, isPortuguese));
    } catch (err) {
        // Exception fetching readings
        return [];
    }
};

/**
 * Atualiza uma leitura (adicionar rating, notes, etc)
 */
export const updateReadingInSupabase = async (
    readingId: string,
    updates: Partial<SavedReading>
): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        // Supabase not configured
        return false;
    }

    try {
        const { error } = await supabase
            .from('readings')
            .update(updates)
            .eq('id', readingId);

        if (error) {
            // Error updating reading
            return false;
        }

                return true;
    } catch (err) {
        // Exception updating reading
        return false;
    }
};

/**
 * Deleta uma leitura do Supabase
 */
export const deleteReadingFromSupabase = async (readingId: string | number): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        // Supabase not configured
        return false;
    }

    try {
        const { error } = await supabase
            .from('readings')
            .delete()
            .eq('id', readingId);

        if (error) {
            // Error deleting reading
            return false;
        }

                return true;
    } catch (err) {
        // Exception deleting reading
        return false;
    }
};

// ============================================
// PHYSICAL READING FUNCTIONS
// ============================================

export interface PhysicalReadingData {
    spreadType: string;
    cards: string[]; // Array of card names
    question?: string;
    interpretation: any; // The AI interpretation result
}

/**
 * Salva uma tiragem física no Supabase
 */
// ============================================
// GUEST READING STORAGE (localStorage)
// ============================================

export interface GuestReading {
    spreadType: string;
    cards: TarotCard[];
    question?: string;
    synthesis?: string;
    rawSynthesis?: any;
    createdAt: string;
    isPhysical?: boolean;
}

const GUEST_READING_KEY = 'tarot_guest_reading';
const GUEST_READING_VIEWED_KEY = 'tarot_guest_reading_viewed';

/**
 * Salva uma leitura de convidado no localStorage
 */
export const saveGuestReading = (reading: GuestReading): void => {
    try {
        localStorage.setItem(GUEST_READING_KEY, JSON.stringify(reading));
        localStorage.removeItem(GUEST_READING_VIEWED_KEY); // Reset viewed flag
    } catch (err) {
        console.error('Error saving guest reading:', err);
    }
};

/**
 * Obtém a leitura salva do convidado
 */
export const getGuestReading = (): GuestReading | null => {
    try {
        const stored = localStorage.getItem(GUEST_READING_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    } catch (err) {
        console.error('Error getting guest reading:', err);
        return null;
    }
};

/**
 * Remove a leitura do convidado (após conversão ou expiração)
 */
export const clearGuestReading = (): void => {
    try {
        localStorage.removeItem(GUEST_READING_KEY);
        localStorage.removeItem(GUEST_READING_VIEWED_KEY);
    } catch (err) {
        console.error('Error clearing guest reading:', err);
    }
};

/**
 * Verifica se há uma leitura de convidado pendente
 */
export const hasGuestReading = (): boolean => {
    return localStorage.getItem(GUEST_READING_KEY) !== null;
};

/**
 * Marca a leitura do convidado como visualizada
 */
export const markGuestReadingAsViewed = (): void => {
    localStorage.setItem(GUEST_READING_VIEWED_KEY, 'true');
};

/**
 * Verifica se a leitura do convidado já foi visualizada
 */
export const isGuestReadingViewed = (): boolean => {
    return localStorage.getItem(GUEST_READING_VIEWED_KEY) === 'true';
};

/**
 * Transfere a leitura do convidado para o Supabase após registro
 * Retorna true se a transferência foi bem sucedida
 */
export const transferGuestReadingToUser = async (
    userId: string,
    isPortuguese: boolean = true
): Promise<boolean> => {
    const guestReading = getGuestReading();

    if (!guestReading) {
        return false;
    }

    try {
        // Salvar no Supabase usando os dados do guest
        const success = await saveReadingToSupabase(
            userId,
            guestReading.spreadType,
            guestReading.cards,
            guestReading.question,
            guestReading.synthesis,
            0,
            ''
        );

        if (success) {
            // Limpar a leitura do convidado após transferência bem sucedida
            clearGuestReading();
            return true;
        }

        return false;
    } catch (err) {
        console.error('Error transferring guest reading:', err);
        return false;
    }
};

export const savePhysicalReading = async (
    userId: string,
    data: PhysicalReadingData,
    isPortuguese: boolean = true
): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        // Supabase not configured
        return false;
    }

    try {
        // Format interpretation as synthesis text
        let synthesisText = '';
        const interp = data.interpretation;

        if (interp) {
            const parts: string[] = [];

            if (data.question) {
                parts.push(`${isPortuguese ? 'PERGUNTA' : 'QUESTION'}: "${data.question}"`);
            }

            if (interp.tema_central) {
                parts.push(`${isPortuguese ? 'TEMA' : 'THEME'}: ${interp.tema_central}`);
            }

            if (interp.visao_geral) {
                parts.push(`\n${interp.visao_geral}`);
            }

            if (interp.cartas && Array.isArray(interp.cartas)) {
                parts.push(`\n${isPortuguese ? '--- CARTAS ---' : '--- CARDS ---'}`);
                interp.cartas.forEach((c: any) => {
                    parts.push(`${c.posicao} (${c.carta}): ${c.interpretacao}`);
                });
            }

            if (interp.sintese_final) {
                parts.push(`\n${isPortuguese ? 'SÍNTESE FINAL' : 'FINAL SYNTHESIS'}: ${interp.sintese_final}`);
            }

            synthesisText = parts.join('\n');
        }

        // Convert card names to card objects for storage
        // Inclui imagens das cartas baseando-se no nome
        const cardsData = data.cards.map((cardName, index) => ({
            id: `physical_${index}`,
            name: cardName,
            arcana: 'unknown',
            suit: 'None',
            imageUrl: findCardImageByName(cardName)
        }));

        const { error } = await supabase
            .from('readings')
            .insert([{
                user_id: userId,
                spread_type: `physical_${data.spreadType}`,
                cards: cardsData,
                question: data.question || null,
                synthesis: synthesisText || null,
                notes: interp?.tema_central || null
            }]);

        if (error) return false;
        return true;
    } catch {
        return false;
    }
};
