// Service para salvar leituras no Supabase
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TarotCard } from '../types';

export interface SavedReading {
    user_id: string;
    spread_type: string;
    cards: TarotCard[];
    question?: string;
    synthesis?: string;
    rating?: number;
    notes?: string;
}

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
        console.log('Supabase not configured, skipping database save');
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
            console.error('Error saving reading to Supabase:', error);
            return false;
        }

        console.log('Reading saved successfully to Supabase');
        return true;
    } catch (err) {
        console.error('Exception saving reading to Supabase:', err);
        return false;
    }
};

/**
 * Busca histórico de leituras do Supabase
 */
export const fetchReadingsFromSupabase = async (userId: string, limit: number = 20) => {
    if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, skipping fetch');
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
            console.error('Error fetching readings from Supabase:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Exception fetching readings from Supabase:', err);
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
        console.log('Supabase not configured, skipping update');
        return false;
    }

    try {
        const { error } = await supabase
            .from('readings')
            .update(updates)
            .eq('id', readingId);

        if (error) {
            console.error('Error updating reading in Supabase:', error);
            return false;
        }

        console.log('Reading updated successfully in Supabase');
        return true;
    } catch (err) {
        console.error('Exception updating reading in Supabase:', err);
        return false;
    }
};

/**
 * Deleta uma leitura do Supabase
 */
export const deleteReadingFromSupabase = async (readingId: string | number): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, skipping delete');
        return false;
    }

    try {
        const { error } = await supabase
            .from('readings')
            .delete()
            .eq('id', readingId);

        if (error) {
            console.error('Error deleting reading from Supabase:', error);
            return false;
        }

        console.log('Reading deleted successfully from Supabase');
        return true;
    } catch (err) {
        console.error('Exception deleting reading from Supabase:', err);
        return false;
    }
};
