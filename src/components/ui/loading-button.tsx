
import { Button, ButtonProps } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  spinnerSize?: 'xs' | 'sm' | 'md' | 'lg';
}

export function LoadingButton({
  children,
  isLoading = false,
  loadingText,
  disabled,
  spinnerSize = 'sm',
  ...props
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={isLoading || disabled}>
      {isLoading ? (
        <>
          <LoadingSpinner size={spinnerSize} className="mr-2" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
