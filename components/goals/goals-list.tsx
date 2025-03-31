'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Progress } from '../ui/progress';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, ChevronRight, CheckCircle2, Pencil, Trash2, Archive, GripVertical } from 'lucide-react';
import { AddGoalUpdate } from './add-goal-update';
import { EditGoalDialog } from './edit-goal-dialog';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  goals as Goal,
  goalMilestones as GoalMilestone, 
  goalJournalEntries as GoalJournalEntry, 
  goalCategories as GoalCategory 
} from '@/db/v3.schema';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from './strict-mode-droppable';

interface GoalWithRelations extends Omit<typeof Goal, 'subcategoryId'> {
  subcategoryId: string | null;
  subcategory?: {
    id: string;
    name: string;
    categoryId: string;
    category?: {
      id: string;
      name: string;
    };
  } | null;
  milestones: typeof GoalMilestone[];
  journalEntries: typeof GoalJournalEntry[];
}

export default function GoalsList() {
  const { data: goals, isLoading } = trpc.goals.list.useQuery() as { 
    data: GoalWithRelations[] | undefined;
    isLoading: boolean;
  };
  const utils = trpc.useContext();
  const [openGoals, setOpenGoals] = useState<string[]>([]);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const deleteGoal = trpc.goals.delete.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      utils.goals.getStats.invalidate();
    },
  });

  const archiveGoal = trpc.goals.archive.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      utils.goals.getStats.invalidate();
    },
  });

  const toggleMilestone = trpc.goals.toggleMilestone.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
    }
  });

  const reorderMilestones = trpc.goals.reorderMilestones.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
    }
  });

  // Group goals by category and archive status
  const { activeGoals, archivedGoals } = goals?.reduce((acc, goal) => {
    if (goal.status.toString() === 'archived') {
      acc.archivedGoals.push(goal);
    } else {
      acc.activeGoals.push(goal);
    }
    return acc;
  }, { activeGoals: [] as GoalWithRelations[], archivedGoals: [] as GoalWithRelations[] }) ?? { activeGoals: [], archivedGoals: [] };

  const goalsToGroup = showArchived ? archivedGoals : activeGoals;

  // Group goals by category and subcategory
  const goalsByHierarchy = goalsToGroup?.reduce((acc, goal) => {
    const category = goal.subcategory?.category;
    const categoryId = category?.id || 'uncategorized';
    const categoryName = category?.name || 'Uncategorized';
    const subcategoryId = goal.subcategory?.id || 'uncategorized';
    const subcategoryName = goal.subcategory?.name || 'Uncategorized';
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        name: categoryName,
        subcategories: {}
      };
    }
    
    if (!acc[categoryId].subcategories[subcategoryId]) {
      acc[categoryId].subcategories[subcategoryId] = {
        name: subcategoryName,
        goals: []
      };
    }
    
    acc[categoryId].subcategories[subcategoryId].goals.push(goal);
    return acc;
  }, {} as Record<string, { 
    name: string; 
    subcategories: Record<string, {
      name: string;
      goals: GoalWithRelations[];
    }>;
  }>);

  // Update openCategories only when goals change, not when goalsByCategory changes
  useEffect(() => {
    if (goals?.length) {
      const categories = goals.reduce((acc, goal) => {
        const categoryId = goal.subcategory?.category?.id || 'uncategorized';
        if (!acc.includes(categoryId)) {
          acc.push(categoryId);
        }
        return acc;
      }, [] as string[]);
      
      setOpenCategories(categories);
    }
  }, [goals]); // Only depend on goals changing

  // Sort categories to put Uncategorized last
  const sortedCategories = Object.entries(goalsByHierarchy).sort(([idA, a], [idB, b]) => {
    if (idA === 'uncategorized') return 1;
    if (idB === 'uncategorized') return -1;
    return a.name.localeCompare(b.name);
  });

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleGoal = (goalId: string) => {
    setOpenGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };
  
  const onDragEnd = (result: DropResult, goalId: string) => {
    if (!result.destination) return;

    const goal = goals?.find(g => g.id.toString() === goalId);
    if (!goal?.milestones) return;

    const items = Array.from(goal.milestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedMilestones = items.map((item, index) => ({
      id: item.id.toString(),
      position: index
    }));

    reorderMilestones.mutate({ milestones: updatedMilestones });
  };

  if (isLoading) {
    return <div>Loading goals...</div>;
  }

  if (!goals?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No goals yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary-dark">
          {showArchived ? 'Archived Goals' : 'Active Goals'}
        </h2>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="text-sm bg-primary-dark text-primary-light"
        >
          {showArchived ? 'Show Active Goals' : 'Show Archived Goals'}
        </Button>
      </div>

      {sortedCategories.map(([categoryId, category]) => (
        <div key={categoryId} className="space-y-2">
          <button
            onClick={() => toggleCategory(categoryId)}
            className="flex items-center gap-2 text-xl font-semibold w-full text-left p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {openCategories.includes(categoryId) ? (
              <ChevronDown className="w-6 h-6" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
            {category.name}
          </button>

          {openCategories.includes(categoryId) && (
            <div className="space-y-4 pl-4">
              {Object.entries(category.subcategories).map(([subId, subcategory]) => (
                <div key={subId} className="space-y-2">
                  <h3 className="text-lg font-medium text-primary-dark/80 pl-3">
                    {subcategory.name}
                    <span className="text-sm font-normal opacity-70 ml-2">
                      ({subcategory.goals.length})
                    </span>
                  </h3>
                  <div className="space-y-4 pl-3">
                    {subcategory.goals.map((goal) => (
                      <Collapsible
                        key={goal.id.toString()}
                        open={openGoals.includes(goal.id.toString())}
                        onOpenChange={() => toggleGoal(goal.id.toString())}
                        className="card-glass rounded-lg hover:ring-1 hover:ring-white/10 transition-all"
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-start gap-3">
                                {openGoals.includes(goal.id.toString()) ? (
                                  <ChevronDown className="w-5 h-5 mt-1 opacity-70" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 mt-1 opacity-70" />
                                )}
                                <div className="text-left">
                                  <h3 className="text-lg font-medium leading-tight">{goal.title.toString()}</h3>
                                  <p className="text-sm opacity-70 mt-1">{goal.description.toString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingGoal(goal.id.toString());
                                  }}
                                  className="h-8 w-8 hover:bg-white/10"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveGoal.mutate({ id: goal.id.toString() });
                                  }}
                                  className="h-8 w-8 hover:bg-white/10"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGoalToDelete(goal.id.toString());
                                  }}
                                  className="h-8 w-8 hover:bg-white/10 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(goal.status.toString(), goal.targetDate?.toString())}`}>
                                  {goal.targetDate && 
                                   goal.status.toString() !== 'completed' && 
                                   goal.status.toString() !== 'archived' && 
                                   new Date(goal.targetDate.toString()) < new Date() 
                                    ? 'Overdue' 
                                    : goal.status.toString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span>{goal.percentComplete.toString()}% Complete</span>
                                <span className="opacity-70">
                                  Due {goal.targetDate ? format(new Date(goal.targetDate.toString()), 'MMM d, yyyy') : 'No date'}
                                </span>
                              </div>
                              <Progress 
                                value={Number(goal.percentComplete)} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="px-4 pb-4 border-t border-white/10 mt-2 pt-4">
                            <div className="space-y-6">
                              {goal.milestones?.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">Milestones</h4>
                                  <DragDropContext onDragEnd={(result) => onDragEnd(result, goal.id.toString())}>
                                    <StrictModeDroppable droppableId={`milestones-${goal.id.toString()}`} type="MILESTONE">
                                      {(provided) => (
                                        <div 
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          className="space-y-2"
                                        >
                                          {goal.milestones.map((milestone, index) => (
                                            <Draggable 
                                              key={milestone.id.toString()} 
                                              draggableId={milestone.id.toString()} 
                                              index={index}
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  style={{
                                                    ...provided.draggableProps.style,
                                                    transform: snapshot.isDragging 
                                                      ? `translate(${parseInt(provided.draggableProps.style?.transform?.split('(')[1]?.split(',')[0] || '0') - 100}px, ${parseInt(provided.draggableProps.style?.transform?.split(',')[1] || '0') - 275}px)`
                                                      : provided.draggableProps.style?.transform,
                                                  }}
                                                  className="flex items-center gap-3 text-sm p-2 rounded bg-primary-light"
                                                >
                                                  <div {...provided.dragHandleProps}>
                                                    <GripVertical className="w-4 h-4 opacity-50 cursor-grab active:cursor-grabbing" />
                                                  </div>
                                                  <button
                                                    onClick={() => toggleMilestone.mutate({ id: milestone.id.toString() })}
                                                    className="hover:scale-110 transition-transform"
                                                  >
                                                    <CheckCircle2 
                                                      className={`w-4 h-4 ${
                                                        milestone.isComplete 
                                                          ? 'text-green-400' 
                                                          : 'text-primary-dark/30 hover:text-primary-dark/50'
                                                      }`}
                                                    />
                                                  </button>
                                                  <span className={milestone.isComplete ? 'line-through opacity-50' : ''}>
                                                    {milestone.description.toString()}
                                                  </span>
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </StrictModeDroppable>
                                  </DragDropContext>
                                </div>)}

                                <div>
                                  <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium">Recent Updates</h4>
                                  </div>

                                  <div className="space-y-3 mt-4">
                                    {goal.journalEntries?.map((entry: typeof GoalJournalEntry) => (
                                      <div
                                        key={entry.id.toString()}
                                        className="text-sm bg-primary-light/50 rounded-lg p-3 space-y-2"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <span className="text-primary-dark/70">
                                              {format(new Date(entry.entryDate.toString()), 'MMM d, yyyy')}
                                            </span>
                                            <div className="flex items-center gap-2 mt-1">
                                              <div className="h-2 w-2 rounded-full bg-primary-dark/30" />
                                              <span className="font-medium">
                                                Progress updated to {entry.progressUpdate.toString()}%
                                              </span>
                                            </div>
                                          </div>
                                          {entry.progressUpdate && (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                              Number(entry.progressUpdate) === 100 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-primary-dark/10 text-primary-dark/70'
                                            }`}>
                                              {Number(entry.progressUpdate) === 100 ? 'Completed' : `${entry.progressUpdate}%`}
                                            </span>
                                          )}
                                        </div>
                                        {entry.notes && (
                                          <p className="text-primary-dark/80 mt-2 whitespace-pre-wrap">
                                            {entry.notes.toString()}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <AddGoalUpdate 
                                    goalId={goal.id.toString()} 
                                    currentProgress={Number(goal.percentComplete)} 
                                  />
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <AlertDialog 
        open={!!goalToDelete} 
        onOpenChange={(open) => !open && setGoalToDelete(null)}
      >
        <AlertDialogContent className="bg-background/95 backdrop-blur">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this goal and all its milestones and updates. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setGoalToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (goalToDelete) {
                  deleteGoal.mutate({ id: goalToDelete });
                  setGoalToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingGoal && (
        <EditGoalDialog
          goal={{
            id: editingGoal,
            title: goals.find(g => g.id.toString() === editingGoal)!.title.toString(),
            description: goals.find(g => g.id.toString() === editingGoal)!.description?.toString() ?? null,
            subcategoryId: goals.find(g => g.id.toString() === editingGoal)!.subcategoryId?.toString() ?? null,
            targetDate: goals.find(g => g.id.toString() === editingGoal)!.targetDate?.toString() ?? null,
            status: goals.find(g => g.id.toString() === editingGoal)!.status.toString(),
            milestones: goals.find(g => g.id.toString() === editingGoal)!.milestones.map(m => ({
              id: m.id.toString(),
              description: m.description.toString(),
              isComplete: !!m.isComplete
            })),
          }}
          open={true}
          onOpenChange={(open) => !open && setEditingGoal(null)}
        />
      )}
    </div>
  );
}

function getStatusBadgeColor(status: string, targetDate: string | null) {
  // Check if goal is overdue
  if (targetDate && 
      status.toString() !== 'completed' && 
      status.toString() !== 'archived' && 
      new Date(targetDate) < new Date()) {
    return 'bg-red-600 text-white';
  }

  switch (status.toString()) {
    case 'active':
      return 'bg-blue-600 text-white';
    case 'completed':
      return 'bg-green-600 text-white';
    case 'on_hold':
      return 'bg-amber-600 text-white';
    case 'archived':
      return 'bg-gray-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
} 