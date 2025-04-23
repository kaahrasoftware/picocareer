
import React from "react";
import { Loader2 } from "lucide-react";
import { ContentType } from "./utils";

interface ContentSelectProps {
  contentList: {id: string, title: string}[];
  selectedContentIds: string[];
  setSelectedContentIds: (ids: string[]) => void;
  loadingContent: boolean;
  randomSelect: boolean;
  setRandomSelect: (v: boolean) => void;
  randomCount: number;
  setRandomCount: (n: number) => void;
  contentType: ContentType;
}

export function ContentSelect({
  contentList,
  selectedContentIds,
  setSelectedContentIds,
  loadingContent,
  randomSelect,
  setRandomSelect,
  randomCount,
  setRandomCount,
}: ContentSelectProps) {
  return (
    <div>
      <label htmlFor="selectContent" className="block font-medium mb-1">Select Content</label>
      {loadingContent ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-4 h-4" /> Loading...
        </div>
      ) : (
        <select
          id="selectContent"
          multiple
          disabled={randomSelect}
          value={selectedContentIds}
          onChange={e => {
            const options = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedContentIds(options);
          }}
          className="w-full border px-3 py-2 rounded min-h-[4rem]"
          required={!randomSelect}
          size={Math.min(Math.max(4, contentList.length), 8)}
        >
          {contentList.map(option => (
            <option key={option.id} value={option.id}>{option.title}</option>
          ))}
        </select>
      )}
      <div className="flex items-center space-x-4 mt-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={randomSelect}
            onChange={e => setRandomSelect(e.target.checked)}
            className="mr-2"
          />
          Select Random
        </label>
        {randomSelect && (
          <input
            type="number"
            min={1}
            max={contentList.length || 1}
            value={randomCount}
            onChange={e => setRandomCount(Math.max(1, Math.min(Number(e.target.value), contentList.length || 1)))}
            className="w-20 border px-2 py-1 rounded"
            disabled={!randomSelect}
          />
        )}
        {randomSelect && (
          <span className="text-xs text-muted-foreground">
            (Selects {randomCount} random)
          </span>
        )}
      </div>
    </div>
  );
}
