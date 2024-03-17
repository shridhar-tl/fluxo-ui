import { useState, useEffect } from 'react';

interface UseNowIndicatorOptions {
  enabled: boolean;
  intervalMs?: number;
}

interface UseNowIndicatorReturn {
  now: Date;
  minuteOfDay: number;
}

export function useNowIndicator(options: UseNowIndicatorOptions): UseNowIndicatorReturn {
  const { enabled, intervalMs = 60000 } = options;
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs]);

  const minuteOfDay = now.getHours() * 60 + now.getMinutes();

  return { now, minuteOfDay };
}
