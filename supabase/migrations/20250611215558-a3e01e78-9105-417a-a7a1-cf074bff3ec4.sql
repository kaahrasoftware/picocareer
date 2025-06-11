
-- Add enum for transaction types
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'refund', 'adjustment', 'bonus');

-- Add enum for transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Add enum for transaction category
CREATE TYPE transaction_category AS ENUM ('purchase', 'session', 'content', 'refund', 'adjustment', 'bonus');

-- Modify the token_transactions table to add new fields
ALTER TABLE token_transactions
ADD COLUMN transaction_status transaction_status DEFAULT 'completed',
ADD COLUMN category transaction_category DEFAULT 'purchase',
ADD COLUMN metadata jsonb DEFAULT '{}',
ADD COLUMN reference_id uuid,
ADD COLUMN original_amount integer,
ADD COLUMN discount_amount integer DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX idx_token_transactions_status ON token_transactions(transaction_status);
CREATE INDEX idx_token_transactions_category ON token_transactions(category);
CREATE INDEX idx_token_transactions_wallet_id_created_at ON token_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_token_transactions_reference_id ON token_transactions(reference_id);

-- Function to safely deduct tokens with balance validation
CREATE OR REPLACE FUNCTION deduct_tokens(
  p_wallet_id uuid,
  p_amount integer,
  p_description text,
  p_category transaction_category DEFAULT 'content',
  p_reference_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance integer;
  v_transaction_id uuid;
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM wallets
  WHERE id = p_wallet_id
  FOR UPDATE;
  
  -- Check if wallet exists
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Wallet not found'
    );
  END IF;
  
  -- Check if sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient token balance',
      'current_balance', v_current_balance,
      'required', p_amount
    );
  END IF;
  
  -- Deduct from wallet
  UPDATE wallets
  SET balance = balance - p_amount,
      updated_at = NOW()
  WHERE id = p_wallet_id;
  
  -- Create transaction record
  INSERT INTO token_transactions (
    wallet_id,
    transaction_type,
    amount,
    description,
    transaction_status,
    category,
    reference_id,
    metadata
  ) VALUES (
    p_wallet_id,
    'debit',
    p_amount,
    p_description,
    'completed',
    p_category,
    p_reference_id,
    p_metadata
  ) RETURNING id INTO v_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_current_balance - p_amount
  );
END;
$$;

-- Function to refund tokens
CREATE OR REPLACE FUNCTION refund_tokens(
  p_wallet_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction_id uuid;
  v_new_balance integer;
BEGIN
  -- Add to wallet
  UPDATE wallets
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_wallet_id
  RETURNING balance INTO v_new_balance;
  
  -- Check if wallet exists
  IF v_new_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Wallet not found'
    );
  END IF;
  
  -- Create refund transaction record
  INSERT INTO token_transactions (
    wallet_id,
    transaction_type,
    amount,
    description,
    transaction_status,
    category,
    reference_id,
    metadata
  ) VALUES (
    p_wallet_id,
    'refund',
    p_amount,
    p_description,
    'completed',
    'refund',
    p_reference_id,
    p_metadata
  ) RETURNING id INTO v_transaction_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance
  );
END;
$$;

-- Function to get transaction summary for analytics
CREATE OR REPLACE FUNCTION get_transaction_summary(
  p_wallet_id uuid,
  p_start_date timestamp with time zone DEFAULT NULL,
  p_end_date timestamp with time zone DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_purchased integer := 0;
  v_total_spent integer := 0;
  v_total_refunded integer := 0;
  v_transaction_count integer := 0;
BEGIN
  -- Calculate totals
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END), 0) as purchased,
    COALESCE(SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END), 0) as spent,
    COALESCE(SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END), 0) as refunded,
    COUNT(*) as total_transactions
  INTO v_total_purchased, v_total_spent, v_total_refunded, v_transaction_count
  FROM token_transactions
  WHERE wallet_id = p_wallet_id
    AND (p_start_date IS NULL OR created_at >= p_start_date)
    AND (p_end_date IS NULL OR created_at <= p_end_date);
  
  RETURN jsonb_build_object(
    'total_purchased', v_total_purchased,
    'total_spent', v_total_spent,
    'total_refunded', v_total_refunded,
    'net_tokens', v_total_purchased - v_total_spent + v_total_refunded,
    'transaction_count', v_transaction_count
  );
END;
$$;

-- Add trigger to update mentor session types when careers table token_cost changes
CREATE OR REPLACE FUNCTION update_session_costs_on_career_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- This would update mentor session costs based on career token costs
  -- Implementation depends on business logic
  RETURN NEW;
END;
$$;

-- Update the handle-stripe-webhook to use new transaction structure
-- This will be handled in the code update
