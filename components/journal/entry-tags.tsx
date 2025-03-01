import Link from "next/link";

interface EntryTagsProps {
  tags: string[];
}

export default function EntryTags({ tags }: EntryTagsProps) {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.map(tag => (
        <Link 
          key={tag}
          href={`/journal/tags/${encodeURIComponent(tag)}`}
          className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          # {tag}
        </Link>
      ))}
    </div>
  );
} 