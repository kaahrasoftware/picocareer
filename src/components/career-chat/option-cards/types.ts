
import { MessageOption } from '@/types/database/message-types';

export type OptionCardsLayout = 'buttons' | 'cards' | 'chips';

export interface OptionCardsProps {
  options: string[] | MessageOption[];
  onSelect: (option: string) => void;
  layout?: OptionCardsLayout;
  allowMultiple?: boolean;
}

export interface NormalizedOption extends MessageOption {
  id: string;
  text: string;
  icon?: string;
  description?: string;
  category?: string;
}
