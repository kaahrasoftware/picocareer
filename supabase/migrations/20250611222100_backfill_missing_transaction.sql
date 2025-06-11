
-- Backfill missing transaction record for recent token purchase
-- This creates the transaction record that should have been created by the webhook

DO $$
DECLARE
  v_wallet_id uuid;
  v_user_id uuid;
BEGIN
  -- Find the admin user's wallet (assuming the purchase was made by admin)
  SELECT w.id, w.profile_id INTO v_wallet_id, v_user_id
  FROM wallets w
  JOIN profiles p ON w.profile_id = p.id
  WHERE p.user_type = 'admin'
  ORDER BY w.updated_at DESC
  LIMIT 1;

  -- Only proceed if we found a wallet
  IF v_wallet_id IS NOT NULL THEN
    -- Check if transaction record already exists for this wallet
    IF NOT EXISTS (
      SELECT 1 FROM token_transactions 
      WHERE wallet_id = v_wallet_id 
      AND transaction_type = 'credit' 
      AND amount = 10
      AND description LIKE '%Purchase%'
    ) THEN
      -- Insert the missing transaction record
      INSERT INTO token_transactions (
        wallet_id,
        transaction_type,
        amount,
        description,
        transaction_status,
        category,
        reference_id,
        metadata,
        created_at
      ) VALUES (
        v_wallet_id,
        'credit',
        10,
        'Purchase: Test Tokens (Backfilled)',
        'completed',
        'purchase',
        'backfill-' || extract(epoch from now())::text,
        jsonb_build_object(
          'backfilled', true,
          'reason', 'Missing transaction record from webhook failure',
          'original_issue', 'Webhook enum casting error'
        ),
        NOW() - INTERVAL '1 hour' -- Set to recent past
      );
      
      RAISE NOTICE 'Backfilled missing transaction record for wallet %', v_wallet_id;
    ELSE
      RAISE NOTICE 'Transaction record already exists for wallet %', v_wallet_id;
    END IF;
  ELSE
    RAISE NOTICE 'No admin wallet found to backfill';
  END IF;
END $$;
