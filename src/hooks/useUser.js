import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ADJECTIVES = ['Cool', 'Epic', 'Mega', 'Super', 'Ultra', 'Hyper', 'Turbo', 'Cosmic', 'Stellar', 'Neon'];
const NOUNS = ['Beats', 'Vibes', 'Sound', 'Echo', 'Wave', 'Pulse', 'Rhythm', 'Bass', 'Drop', 'Mix'];

const generateRandomUsername = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(Math.random() * 999);
    return `${adj}${noun}${num}`;
};

export function useUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initUser();
    }, []);

    const initUser = async () => {
        try {
            // Get or create local user ID
            let userId = localStorage.getItem('sonicgrid_user_id');

            if (!userId) {
                // Create new anonymous user
                userId = crypto.randomUUID();
                localStorage.setItem('sonicgrid_user_id', userId);

                const username = generateRandomUsername();

                // Create profile in Supabase
                const { data, error } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: userId,
                            username: username,
                            created_at: new Date().toISOString()
                        }
                    ])
                    .select()
                    .single();

                if (error) {
                    console.error('Error creating profile:', error);
                    // Fallback to local-only mode
                    setUser({ id: userId, username, local: true });
                } else {
                    setUser(data);
                }
            } else {
                // Load existing profile
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error || !data) {
                    // Profile doesn't exist in DB, create it
                    const username = generateRandomUsername();
                    const { data: newData, error: insertError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: userId,
                                username: username,
                                created_at: new Date().toISOString()
                            }
                        ])
                        .select()
                        .single();

                    if (insertError) {
                        setUser({ id: userId, username, local: true });
                    } else {
                        setUser(newData);
                    }
                } else {
                    setUser(data);
                }
            }
        } catch (err) {
            console.error('User init error:', err);
            // Fallback mode
            const userId = localStorage.getItem('sonicgrid_user_id') || crypto.randomUUID();
            localStorage.setItem('sonicgrid_user_id', userId);
            setUser({ id: userId, username: generateRandomUsername(), local: true });
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;
            setUser(data);
            return { success: true };
        } catch (err) {
            console.error('Update profile error:', err);
            return { success: false, error: err.message };
        }
    };

    return { user, loading, updateProfile };
}
