
-- Create the welcome reward function
CREATE OR REPLACE FUNCTION public.process_welcome_reward(p_profile_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_transaction_id UUID;
  v_welcome_amount INTEGER := 25;
  v_existing_welcome_reward UUID;
BEGIN
  -- Check if user already received welcome reward (prevent duplicates)
  SELECT id INTO v_existing_welcome_reward
  FROM token_transactions
  WHERE wallet_id IN (SELECT id FROM wallets WHERE profile_id = p_profile_id)
    AND description = 'Welcome bonus for new account'
    AND category = 'bonus';
  
  IF v_existing_welcome_reward IS NOT NULL THEN
    RAISE NOTICE 'Welcome reward already processed for user %', p_profile_id;
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Welcome reward already processed',
      'already_processed', true
    );
  END IF;
  
  -- Get or create user's wallet
  SELECT id INTO v_wallet_id
  FROM wallets
  WHERE profile_id = p_profile_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (profile_id, balance)
    VALUES (p_profile_id, 0)
    RETURNING id INTO v_wallet_id;
    
    RAISE NOTICE 'Created new wallet for user %', p_profile_id;
  END IF;
  
  -- Add welcome tokens to wallet
  UPDATE wallets
  SET balance = balance + v_welcome_amount,
      updated_at = NOW()
  WHERE id = v_wallet_id;
  
  -- Create transaction record
  INSERT INTO token_transactions (
    wallet_id,
    transaction_type,
    amount,
    description,
    transaction_status,
    category,
    metadata
  ) VALUES (
    v_wallet_id,
    'credit',
    v_welcome_amount,
    'Welcome bonus for new account',
    'completed',
    'bonus',
    jsonb_build_object('reward_type', 'welcome_bonus', 'awarded_at', NOW())
  ) RETURNING id INTO v_transaction_id;
  
  -- Create welcome notification
  INSERT INTO notifications (
    profile_id,
    title,
    message,
    type,
    action_url,
    category
  ) VALUES (
    p_profile_id,
    'Welcome to PicoCareer! 🎉',
    'You received ' || v_welcome_amount || ' tokens as a welcome bonus for joining PicoCareer!',
    'reward',
    '/profile?tab=wallet',
    'general'
  );
  
  RAISE NOTICE 'Successfully processed welcome reward for user %: % tokens awarded', p_profile_id, v_welcome_amount;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Welcome reward processed successfully',
    'tokens_awarded', v_welcome_amount,
    'transaction_id', v_transaction_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error processing welcome reward for user %: %', p_profile_id, SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error processing welcome reward: ' || SQLERRM
  );
END;
$$;

-- Update the handle_new_user function to include welcome reward
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  v_referral_code TEXT;
  v_user_type TEXT;
  v_user_type_enum public.user_type;
BEGIN
  -- Log the start of user creation
  RAISE NOTICE 'Creating new user profile for user ID: %', NEW.id;
  
  -- Extract referral code from user metadata
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Extract and validate user_type with explicit casting
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'mentee');
  
  -- Validate and cast user_type to enum
  CASE v_user_type
    WHEN 'admin' THEN v_user_type_enum := 'admin'::public.user_type;
    WHEN 'mentor' THEN v_user_type_enum := 'mentor'::public.user_type;
    WHEN 'mentee' THEN v_user_type_enum := 'mentee'::public.user_type;
    WHEN 'editor' THEN v_user_type_enum := 'editor'::public.user_type;
    ELSE v_user_type_enum := 'mentee'::public.user_type;
  END CASE;
  
  RAISE NOTICE 'User type set to: %', v_user_type_enum;
  
  -- Insert new profile with explicit enum casting
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    user_type
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    v_user_type_enum
  );
  
  RAISE NOTICE 'Profile created successfully for user %', NEW.id;
  
  -- Process welcome reward for ALL new users
  BEGIN
    -- Add a small delay to ensure profile is committed
    PERFORM pg_sleep(0.1);
    
    RAISE NOTICE 'Processing welcome reward for new user %', NEW.id;
    
    -- Process the welcome reward
    PERFORM public.process_welcome_reward(NEW.id);
    
    RAISE NOTICE 'Processed welcome reward for new user %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error processing welcome reward for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Process referral reward if we have a referral code
  IF v_referral_code IS NOT NULL AND v_referral_code != '' THEN
    BEGIN
      RAISE NOTICE 'Processing referral with code: %', v_referral_code;
      
      -- Process the referral reward (this gives additional tokens on top of welcome reward)
      PERFORM public.process_referral_reward(NEW.id, v_referral_code);
      
      RAISE NOTICE 'Processed referral for new user % with code %', NEW.id, v_referral_code;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail the signup
      RAISE WARNING 'Error processing referral reward for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  -- Log successful profile creation
  RAISE NOTICE 'Successfully completed user creation for %', NEW.id;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  -- Log detailed error information
  RAISE WARNING 'Error in handle_new_user for user %: SQLSTATE=%, SQLERRM=%', NEW.id, SQLSTATE, SQLERRM;
  
  -- Try to create a basic profile to prevent signup failure
  BEGIN
    INSERT INTO public.profiles (
      id, 
      first_name, 
      last_name, 
      email,
      user_type
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data->>'first_name', 
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      'mentee'::public.user_type
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created fallback profile for user %', NEW.id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Critical error: Could not create fallback profile for user %: SQLSTATE=%, SQLERRM=%', NEW.id, SQLSTATE, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;
