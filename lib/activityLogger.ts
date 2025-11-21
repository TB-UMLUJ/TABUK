import { supabase } from './supabaseClient';
import { User, ActivityAction } from '../types';

export const logActivity = async (
  user: User | null,
  action: ActivityAction,
  details?: Record<string, any>
) => {
  if (!user) {
    console.warn('Activity log attempted without a user.');
    return;
  }

  try {
    const { error } = await supabase.from('activity_log').insert({
      user_id: user.user_id,
      user_full_name: user.full_name,
      action: action,
      action_type: action, // أضف هذا لتلبية قيد "عدم السماح بقيم فارغة"
      details: details || {},
    });

    if (error) {
      console.error('Error logging activity:', error.message, error);
    }
  } catch (err) {
    console.error('Unexpected error in logActivity:', err);
  }
};