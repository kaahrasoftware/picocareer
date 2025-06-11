
-- Function to credit tokens (for purchases)
CREATE OR REPLACE FUNCTION credit_tokens(
  p_wallet_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id text DEFAULT NULL,
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
  
  -- Create credit transaction record
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
    'credit',
    p_amount,
    p_description,
    'completed',
    'purchase',
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
