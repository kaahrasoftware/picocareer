
import React from 'react';
import { TokenDeductionDebugger } from '@/components/debug/TokenDeductionDebugger';

const TokenDeductionTest = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Token Deduction Debug Page</h1>
        <p className="text-muted-foreground">
          This page is for debugging token deduction issues. Use it to test the token deduction flow and identify any problems.
        </p>
      </div>
      
      <TokenDeductionDebugger />
    </div>
  );
};

export default TokenDeductionTest;
