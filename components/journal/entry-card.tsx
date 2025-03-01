import { format } from "date-fns";
import EntryTags from "./entry-tags";

interface EntryCardProps {
  entry: {
    id: string;
    date: string;
    title: string;
    content?: string | null;
    mood?: number | null;
    createdAt: Date;
    tags?: string[];
  };
}

export default function EntryCard({ entry }: EntryCardProps) {
  return (
    <div className="border rounded-lg p-4 mb-4 dark:border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{entry.title}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(entry.date), "MMM d, yyyy")}
        </span>
      </div>
      
      {entry.content && (
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          {entry.content.length > 150 
            ? `${entry.content.substring(0, 150)}...` 
            : entry.content}
        </p>
      )}
      
      {entry.mood && (
        <div className="mb-2">
          <span className="text-sm font-medium">Mood: </span>
          <span>{entry.mood}/10</span>
        </div>
      )}
      
      <EntryTags tags={entry.tags || []} />
    </div>
  );
} 