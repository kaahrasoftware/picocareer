
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BrowserInfo {
  name: string;
  version: string;
  [key: string]: string;
}

interface ResourceInteraction {
  resourceId: string;
  interactionType: 'view' | 'download';
  metadata?: Record<string, any>;
}

export function useResourceTracking() {
  const [isTracking, setIsTracking] = useState(false);

  const getBrowserInfo = (): BrowserInfo => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    return {
      name: browserName,
      version: browserVersion,
    };
  };

  const getConnectionInfo = () => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    } : null;
  };

  const trackResourceInteraction = async ({ 
    resourceId, 
    interactionType, 
    metadata = {} 
  }: ResourceInteraction) => {
    if (isTracking) return;
    
    setIsTracking(true);

    try {
      const browserInfo = getBrowserInfo();
      const connectionInfo = getConnectionInfo();

      // Simplified metadata to avoid type issues
      const interactionMetadata = {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        browser: browserInfo.name + ' ' + browserInfo.version,
        connectionType: connectionInfo?.effectiveType || 'unknown',
        language: navigator.language,
        platform: navigator.platform,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        ...metadata
      };

      const { error } = await supabase
        .from('event_resource_interactions')
        .insert({
          resource_id: resourceId,
          interaction_type: interactionType,
          profile_id: (await supabase.auth.getUser()).data.user?.id || null,
          metadata: interactionMetadata as any
        });

      if (error) {
        console.error('Error tracking resource interaction:', error);
      }
    } catch (error) {
      console.error('Error in trackResourceInteraction:', error);
    } finally {
      setIsTracking(false);
    }
  };

  const trackResourceView = (resourceId: string, metadata?: Record<string, any>) => {
    return trackResourceInteraction({
      resourceId,
      interactionType: 'view',
      metadata
    });
  };

  const trackResourceDownload = (resourceId: string, metadata?: Record<string, any>) => {
    return trackResourceInteraction({
      resourceId,
      interactionType: 'download',
      metadata
    });
  };

  return {
    trackResourceView,
    trackResourceDownload,
    trackResourceInteraction,
    isTracking
  };
}
