
-- Fix the deduct_tokens function to use 'spend' instead of 'debit'
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
  
  -- Create transaction record with 'spend' instead of 'debit'
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
    'spend',  -- Changed from 'debit' to 'spend'
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
