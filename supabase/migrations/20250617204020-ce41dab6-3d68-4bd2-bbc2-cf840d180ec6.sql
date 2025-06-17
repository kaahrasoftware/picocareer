
-- Drop all existing cancel_session functions to resolve overloading conflict
DROP FUNCTION IF EXISTS cancel_session(UUID, TEXT);
DROP FUNCTION IF EXISTS cancel_session(UUID, TEXT, UUID);

-- Create the correct cancel_session function with refund logic
CREATE OR REPLACE FUNCTION cancel_session(
  p_session_id UUID,
  p_reason TEXT DEFAULT 'Cancelled by user',
  p_cancelled_by_user_id UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
  v_availability_id UUID;
  v_mentee_wallet_id UUID;
  v_session_cost INTEGER := 25;
  v_transaction_id UUID;
BEGIN
  -- Get the session details
  SELECT * INTO v_session
  FROM mentor_sessions
  WHERE id = p_session_id;

  IF v_session IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  -- Start transaction
  BEGIN
    -- Find the existing availability slot that's booked with this session
    SELECT id INTO v_availability_id
    FROM mentor_availability
    WHERE booked_session_id = p_session_id;

    -- If found, update it to be available again
    IF v_availability_id IS NOT NULL THEN
      UPDATE mentor_availability
      SET is_available = true,
          booked_session_id = NULL
      WHERE id = v_availability_id;
    END IF;

    -- Update the session status to cancelled
    UPDATE mentor_sessions
    SET status = 'cancelled',
        notes = CASE 
          WHEN notes IS NULL OR notes = '' THEN p_reason
          ELSE notes || E'\n\nCancellation reason: ' || p_reason
        END
    WHERE id = p_session_id;

    -- Refund logic: If mentor cancels (not mentee), refund tokens to mentee
    IF p_cancelled_by_user_id IS NOT NULL AND p_cancelled_by_user_id = v_session.mentor_id THEN
      -- Get mentee's wallet
      SELECT id INTO v_mentee_wallet_id
      FROM wallets
      WHERE profile_id = v_session.mentee_id;

      -- Create wallet if it doesn't exist
      IF v_mentee_wallet_id IS NULL THEN
        INSERT INTO wallets (profile_id, balance)
        VALUES (v_session.mentee_id, 0)
        RETURNING id INTO v_mentee_wallet_id;
      END IF;

      -- Add refund to mentee's wallet
      UPDATE wallets
      SET balance = balance + v_session_cost,
          updated_at = NOW()
      WHERE id = v_mentee_wallet_id;

      -- Create refund transaction record
      INSERT INTO token_transactions (
        wallet_id,
        transaction_type,
        amount,
        description,
        transaction_status,
        category,
        metadata
      ) VALUES (
        v_mentee_wallet_id,
        'refund',
        v_session_cost,
        'Refund for session cancelled by mentor: ' || p_reason,
        'completed',
        'refund',
        jsonb_build_object(
          'session_id', p_session_id,
          'cancelled_by', 'mentor',
          'refund_reason', 'mentor_cancellation'
        )
      ) RETURNING id INTO v_transaction_id;

      -- Create notification for mentee about the refund
      INSERT INTO notifications (
        profile_id,
        title,
        message,
        type,
        action_url,
        category
      ) VALUES (
        v_session.mentee_id,
        'Session Cancelled - Refund Issued',
        'Your session was cancelled by the mentor. You have been refunded ' || v_session_cost || ' tokens.',
        'refund',
        '/profile?tab=wallet',
        'general'
      );

      RAISE NOTICE 'Refunded % tokens to mentee % for session % cancelled by mentor', v_session_cost, v_session.mentee_id, p_session_id;
    END IF;

    -- Return success
    RETURN jsonb_build_object(
      'success', true,
      'session_id', p_session_id,
      'reason', p_reason,
      'refund_issued', (p_cancelled_by_user_id = v_session.mentor_id),
      'refund_amount', CASE WHEN p_cancelled_by_user_id = v_session.mentor_id THEN v_session_cost ELSE 0 END
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error details
      RAISE NOTICE 'Error in cancel_session: %', SQLERRM;
      -- Re-raise the error
      RAISE;
  END;
END;
$$;
