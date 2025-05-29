
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResourceTracking } from '@/hooks/useResourceTracking';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export function BrowserCompatibilityTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { browserInfo, trackView, processQueue } = useResourceTracking();

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Browser Detection
    results.push({
      name: 'Browser Detection',
      status: browserInfo.name !== 'Unknown' ? 'pass' : 'warning',
      message: `Detected: ${browserInfo.name} ${browserInfo.version}`,
      details: browserInfo
    });

    // Test 2: Local Storage
    try {
      const testKey = '__browser_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      results.push({
        name: 'Local Storage',
        status: 'pass',
        message: 'Local storage is available and working'
      });
    } catch (error) {
      results.push({
        name: 'Local Storage',
        status: 'fail',
        message: 'Local storage is not available',
        details: error
      });
    }

    // Test 3: Cookies
    results.push({
      name: 'Cookies',
      status: navigator.cookieEnabled ? 'pass' : 'fail',
      message: navigator.cookieEnabled ? 'Cookies are enabled' : 'Cookies are disabled'
    });

    // Test 4: Network Connection
    try {
      const response = await fetch('https://httpbin.org/get', { method: 'HEAD' });
      results.push({
        name: 'Network Connection',
        status: response.ok ? 'pass' : 'warning',
        message: response.ok ? 'Network requests are working' : 'Network may be restricted'
      });
    } catch (error) {
      results.push({
        name: 'Network Connection',
        status: 'fail',
        message: 'Network requests are blocked or failing',
        details: error
      });
    }

    // Test 5: Supabase Connection
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error && !error.message.includes('session_not_found')) {
        throw error;
      }
      results.push({
        name: 'Supabase Connection',
        status: 'pass',
        message: 'Can connect to Supabase',
        details: { authenticated: !!data.user }
      });
    } catch (error) {
      results.push({
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Cannot connect to Supabase',
        details: error
      });
    }

    // Test 6: CORS Headers
    try {
      const { data } = await supabase.from('event_resources').select('id').limit(1);
      results.push({
        name: 'CORS & Database Access',
        status: 'pass',
        message: 'Database queries work correctly',
        details: { rowCount: data?.length || 0 }
      });
    } catch (error) {
      results.push({
        name: 'CORS & Database Access',
        status: 'fail',
        message: 'Database queries are failing',
        details: error
      });
    }

    // Test 7: Tracking Insertion
    try {
      const testResourceId = 'test-resource-' + Date.now();
      const { data, error } = await supabase
        .from('event_resource_interactions')
        .insert({
          resource_id: testResourceId,
          profile_id: null,
          interaction_type: 'view',
          metadata: { test: true, browser: browserInfo.name }
        })
        .select()
        .single();

      if (error) throw error;

      // Clean up test data
      await supabase
        .from('event_resource_interactions')
        .delete()
        .eq('id', data.id);

      results.push({
        name: 'Tracking Insert Test',
        status: 'pass',
        message: 'Can insert tracking data successfully'
      });
    } catch (error) {
      results.push({
        name: 'Tracking Insert Test',
        status: 'fail',
        message: 'Cannot insert tracking data',
        details: error
      });
    }

    // Test 8: Content Security Policy
    try {
      // Test if we can create a new script tag (CSP test)
      const script = document.createElement('script');
      script.src = 'data:text/javascript,';
      document.head.appendChild(script);
      document.head.removeChild(script);
      
      results.push({
        name: 'Content Security Policy',
        status: 'pass',
        message: 'No CSP restrictions detected'
      });
    } catch (error) {
      results.push({
        name: 'Content Security Policy',
        status: 'warning',
        message: 'CSP restrictions may be affecting functionality',
        details: error
      });
    }

    setTests(results);
    setIsRunning(false);
  };

  const testTracking = () => {
    const testResourceId = 'browser-test-' + Date.now();
    console.log('🧪 Testing tracking with resource ID:', testResourceId);
    trackView(testResourceId, { testSource: 'compatibility-test' });
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Browser Compatibility Test
          <Badge variant="outline">{browserInfo.name} {browserInfo.version}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runTests} disabled={isRunning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
          <Button variant="outline" onClick={testTracking}>
            Test Tracking
          </Button>
          <Button variant="outline" onClick={processQueue}>
            Process Queue
          </Button>
        </div>

        <div className="grid gap-3">
          {tests.map((test, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(test.status)}
                <span className="font-medium">{test.name}</span>
              </div>
              <p className="text-sm">{test.message}</p>
              {test.details && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Show details</summary>
                  <pre className="text-xs mt-1 bg-white/50 p-2 rounded overflow-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Browser Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>User Agent: <code className="text-xs">{navigator.userAgent}</code></div>
            <div>Language: {navigator.language}</div>
            <div>Platform: {navigator.platform}</div>
            <div>Online: {navigator.onLine ? 'Yes' : 'No'}</div>
            <div>Cookies: {navigator.cookieEnabled ? 'Enabled' : 'Disabled'}</div>
            <div>Storage: {browserInfo.storageEnabled ? 'Available' : 'Blocked'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
