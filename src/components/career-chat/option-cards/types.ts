
import { MessageOption } from "@/types/database/message-types";

export interface OptionCardsProps {
  options: (string | MessageOption)[];
  onSelect: (optionText: string) => void;
  layout?: 'cards' | 'chips';
  allowMultiple?: boolean;
  disabled?: boolean;
}

export interface OptionCardsLayoutProps {
  options: MessageOption[];
  selectedOptions: string[];
  handleSelectOption: (option: MessageOption) => void;
  showCustomInput: boolean;
  customValue: string;
  handleCustomValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCustomSubmit: () => void;
  handleSubmitMultiple: () => void;
  allowMultiple: boolean;
  isSelecting: boolean;
  disabled?: boolean;
}
