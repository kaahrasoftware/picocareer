
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, RefreshCw, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useTokenDeductionDebug } from '@/hooks/useTokenDeductionDebug';

export function TokenDeductionDebugger() {
  const { 
    debugTokenDeduction, 
    debugLog, 
    isDebugging, 
    clearDebugLog,
    wallet,
    balance
  } = useTokenDeductionDebug();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Token Deduction Debugger
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Current Wallet: {wallet?.id || 'None'} | Balance: {balance} tokens
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Debug Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={() => debugTokenDeduction(25)}
            disabled={isDebugging}
            className="gap-2"
          >
            {isDebugging && <RefreshCw className="h-4 w-4 animate-spin" />}
            Test Token Deduction (25 tokens)
          </Button>
          
          <Button 
            variant="outline"
            onClick={clearDebugLog}
            disabled={debugLog.length === 0}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Log
          </Button>
        </div>

        {/* Debug Log */}
        {debugLog.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Debug Log</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {debugLog.map((entry, index) => (
                <Card key={index} className={`border-l-4 ${
                  entry.success ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {entry.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{entry.step}</span>
                        <Badge variant={entry.success ? "default" : "destructive"}>
                          {entry.success ? 'Success' : 'Failed'}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {entry.data && (
                      <div className="mt-2">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground">
                            View data
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                    
                    {entry.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <span className="text-sm text-red-700">
                          Error: {entry.error}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {debugLog.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Test Token Deduction" to start debugging the token deduction process.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
