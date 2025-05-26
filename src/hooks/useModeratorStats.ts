
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useModeratorStats = () => {
  const [todayActionsCount, setTodayActionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodayActionsCount = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();

      // Query audit logs for moderator actions today
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id')
        .gte('timestamp', todayISOString)
        .contains('metadata', { moderator_action: true });

      if (error) {
        console.error('Error fetching moderator actions count:', error);
        setTodayActionsCount(0);
      } else {
        setTodayActionsCount(data?.length || 0);
      }
    } catch (error) {
      console.error('Error in fetchTodayActionsCount:', error);
      setTodayActionsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayActionsCount();
  }, []);

  const refreshStats = () => {
    fetchTodayActionsCount();
  };

  return {
    todayActionsCount,
    isLoading,
    refreshStats
  };
};
