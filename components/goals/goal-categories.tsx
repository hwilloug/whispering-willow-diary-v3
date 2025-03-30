import { trpc } from '@/lib/trpc';

export default function GoalCategories() {
  const { data: categories } = trpc.goals.getCategories.useQuery();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary-dark">Categories</h3>
      <div className="space-y-2">
        {categories?.map((category) => (
          <div key={category.id} className="space-y-1">
            <h4 className="font-medium">{category.name}</h4>
            <ul className="pl-4 space-y-1">
              {category.subcategories.map((sub) => (
                <li key={sub.id} className="text-sm text-gray-600 hover:text-primary cursor-pointer">
                  {sub.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 