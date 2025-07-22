
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Coins, Search, X } from "lucide-react";
import { useUserSearch } from "@/hooks/useUserSearch";

interface UserSearchResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  currentBalance: number;
  walletId?: string;
}

interface UserSearchInputProps {
  onUserSelect: (user: UserSearchResult) => void;
  selectedUser?: UserSearchResult | null;
  onClearSelection: () => void;
  placeholder?: string;
}

export function UserSearchInput({ 
  onUserSelect, 
  selectedUser, 
  onClearSelection,
  placeholder = "Search users by email or name..." 
}: UserSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data: searchResults = [], isLoading } = useUserSearch(searchTerm, isOpen && !selectedUser);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
  };

  const handleUserSelect = (user: UserSearchResult) => {
    onUserSelect(user);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClearSelection = () => {
    onClearSelection();
    setSearchTerm('');
    setIsOpen(false);
  };

  if (selectedUser) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">{selectedUser.fullName || 'Unknown User'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="h-3 w-3 text-primary" />
                  <span className="font-medium">{selectedUser.currentBalance} tokens</span>
                  <span className="text-muted-foreground">• {selectedUser.userType}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {isOpen && searchTerm.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((user) => (
                  <Button
                    key={user.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <User className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{user.fullName || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-1 text-xs">
                          <Coins className="h-3 w-3 text-primary" />
                          <span>{user.currentBalance} tokens</span>
                          <span className="text-muted-foreground">• {user.userType}</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No users found matching "{searchTerm}"
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
