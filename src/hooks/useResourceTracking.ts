import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TrackInteractionParams {
  resourceId: string;
  interactionType: 'view' | 'download';
  metadata?: Record<string, any>;
}

interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
  cookiesEnabled: boolean;
  storageEnabled: boolean;
}

// Browser detection and capability checking
const getBrowserInfo = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = '';

  // Detect browser
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Edg')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : '';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : '';
  }

  // Check browser capabilities
  const cookiesEnabled = navigator.cookieEnabled;
  let storageEnabled = false;
  
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    storageEnabled = true;
  } catch (e) {
    storageEnabled = false;
  }

  return {
    name: browserName,
    version: browserVersion,
    userAgent,
    cookiesEnabled,
    storageEnabled
  };
};

// Enhanced error logging
const logTrackingError = (error: any, context: string, browserInfo: BrowserInfo) => {
  console.group(`🚨 Resource Tracking Error - ${context}`);
  console.error('Error details:', error);
  console.log('Browser info:', browserInfo);
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL:', window.location.href);
  console.log('Supabase client state:', {
    url: supabase.supabaseUrl,
    key: supabase.supabaseKey ? 'Present' : 'Missing'
  });
  console.groupEnd();
};

// Retry mechanism with exponential backoff
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`🔄 Retry attempt ${attempt + 1} in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Check if we can make requests to Supabase
const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error && error.message.includes('network')) {
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    return false;
  }
};

// Fallback tracking using localStorage queue
const queueTrackingForLater = (params: TrackInteractionParams) => {
  try {
    const queue = JSON.parse(localStorage.getItem('tracking_queue') || '[]');
    queue.push({
      ...params,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
    localStorage.setItem('tracking_queue', JSON.stringify(queue));
    console.log('📦 Tracking queued for later:', params.resourceId, params.interactionType);
  } catch (error) {
    console.warn('Failed to queue tracking:', error);
  }
};

// Process queued tracking requests
const processTrackingQueue = async () => {
  try {
    const queue = JSON.parse(localStorage.getItem('tracking_queue') || '[]');
    if (queue.length === 0) return;

    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) return;

    const processedIds: number[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        await trackInteractionDirect(item);
        processedIds.push(i);
        console.log('✅ Processed queued tracking:', item.resourceId, item.interactionType);
      } catch (error) {
        console.warn('Failed to process queued item:', error);
        // Increment retry count
        queue[i].retryCount = (queue[i].retryCount || 0) + 1;
        // Remove items that have failed too many times
        if (queue[i].retryCount > 3) {
          processedIds.push(i);
        }
      }
    }

    // Remove processed items
    const remainingQueue = queue.filter((_, index) => !processedIds.includes(index));
    localStorage.setItem('tracking_queue', JSON.stringify(remainingQueue));
  } catch (error) {
    console.warn('Error processing tracking queue:', error);
  }
};

// Direct tracking function
const trackInteractionDirect = async (params: TrackInteractionParams) => {
  const browserInfo = getBrowserInfo();
  
  console.log(`🔍 Starting ${params.interactionType} tracking for resource:`, params.resourceId);
  console.log('📊 Browser info:', browserInfo);
  console.log('📊 Tracking metadata:', params.metadata);
  
  // Get current user with enhanced error handling
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.warn('⚠️ Auth error (continuing with anonymous tracking):', userError);
  }
  
  console.log('👤 Current user for tracking:', user?.id || 'anonymous');
  
  // Enhanced metadata with browser compatibility info
  const enrichedMetadata = {
    ...params.metadata,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    referrer: document.referrer || null,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    browser: browserInfo,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    language: navigator.language,
    platform: navigator.platform,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine
  };

  console.log('📈 Inserting interaction record with enhanced metadata...');
  
  // Insert with retry mechanism
  const result = await retryOperation(async () => {
    const { data, error } = await supabase
      .from('event_resource_interactions')
      .insert({
        resource_id: params.resourceId,
        profile_id: user?.id || null,
        interaction_type: params.interactionType,
        metadata: enrichedMetadata,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error tracking interaction:', error);
      throw error;
    }

    return data;
  }, 3, 1000);

  console.log('✅ Interaction tracked successfully:', result);
  console.log('🔄 Trigger should now update resource counters automatically');
  
  return result;
};

export function useResourceTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const browserInfo = getBrowserInfo();

  // Process any queued tracking on hook initialization
  React.useEffect(() => {
    const timer = setTimeout(() => {
      processTrackingQueue();
    }, 2000); // Wait 2 seconds after component mounts

    return () => clearTimeout(timer);
  }, []);

  // Set up periodic queue processing
  React.useEffect(() => {
    const interval = setInterval(() => {
      processTrackingQueue();
    }, 30000); // Process queue every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const trackInteractionMutation = useMutation({
    mutationFn: async (params: TrackInteractionParams) => {
      try {
        // Check if browser supports required features
        if (!browserInfo.storageEnabled && !browserInfo.cookiesEnabled) {
          throw new Error('Browser does not support required storage features');
        }

        // Test connection first
        const connectionOk = await testSupabaseConnection();
        if (!connectionOk) {
          throw new Error('Cannot connect to Supabase');
        }

        return await trackInteractionDirect(params);
      } catch (error) {
        logTrackingError(error, 'Primary tracking attempt', browserInfo);
        
        // Fallback: queue for later if possible
        if (browserInfo.storageEnabled) {
          queueTrackingForLater(params);
        }
        
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log(`🎉 ${variables.interactionType} tracking completed for resource:`, variables.resourceId);
      
      // Invalidate resource queries to refresh counters in UI
      queryClient.invalidateQueries({ queryKey: ['event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['all-event-resources'] });
      queryClient.invalidateQueries({ queryKey: ['event-resource-stats'] });
      queryClient.invalidateQueries({ queryKey: ['modern-resource-analytics'] });
      
      console.log('🔄 Resource queries invalidated for UI refresh');
    },
    onError: (error, variables) => {
      console.error(`💥 Failed to track ${variables.interactionType} for resource:`, variables.resourceId, error);
      
      // Enhanced error reporting for debugging
      logTrackingError(error, `${variables.interactionType} tracking`, browserInfo);
      
      // Only show toast for critical errors, not for tracking failures
      if (error.message?.includes('network') || error.message?.includes('CORS')) {
        toast({
          title: "Tracking Notice",
          description: "Activity tracking temporarily unavailable. Your action was completed successfully.",
          variant: "default",
        });
      }
    },
  });

  const trackView = (resourceId: string, metadata?: Record<string, any>) => {
    console.log('👁️ Tracking view for resource:', resourceId);
    console.log('🌐 Browser:', browserInfo.name, browserInfo.version);
    
    trackInteractionMutation.mutate({
      resourceId,
      interactionType: 'view',
      metadata: {
        ...metadata,
        interaction_source: 'view_action',
        browser_specific: browserInfo
      },
    });
  };

  const trackDownload = (resourceId: string, metadata?: Record<string, any>) => {
    console.log('⬇️ Tracking download for resource:', resourceId);
    console.log('🌐 Browser:', browserInfo.name, browserInfo.version);
    
    trackInteractionMutation.mutate({
      resourceId,
      interactionType: 'download',
      metadata: {
        ...metadata,
        interaction_source: 'download_action',
        browser_specific: browserInfo
      },
    });
  };

  return {
    trackView,
    trackDownload,
    isTracking: trackInteractionMutation.isPending,
    browserInfo,
    processQueue: processTrackingQueue,
  };
}
