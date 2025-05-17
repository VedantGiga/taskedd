import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Task, insertTaskSchema, Subtask } from '@shared/schema';
import { useTasks, useSubtasks } from '@/hooks/use-task';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  categories: { id: number; name: string; color: string }[];
}

const taskSchema = insertTaskSchema.omit({ userId: true }).extend({
  dueDate: z.string().optional(),
  categoryId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function EditTaskModal({ task, isOpen, onClose, categories }: EditTaskModalProps) {
  const { updateTask, deleteTask } = useTasks();
  const { subtasks, createSubtask, updateSubtask, toggleSubtaskCompletion, deleteSubtask } = useSubtasks(task.id);
  const { toast } = useToast();
  
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : undefined,
      categoryId: task.categoryId ? String(task.categoryId) : undefined,
      completed: task.completed,
    },
  });
  
  // Update form when task changes
  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : undefined,
      categoryId: task.categoryId ? String(task.categoryId) : undefined,
      completed: task.completed,
    });
  }, [task, form]);
  
  const onSubmit = async (data: TaskFormValues) => {
    try {
      const taskData = {
        ...data,
        categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
      };
      
      await updateTask.mutateAsync({ id: task.id, task: taskData });
      
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully."
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "There was an error updating your task. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    
    try {
      await createSubtask.mutateAsync({
        title: newSubtaskTitle,
        completed: false,
      });
      
      setNewSubtaskTitle('');
      
      toast({
        title: "Subtask added",
        description: "The subtask has been added successfully."
      });
    } catch (error) {
      toast({
        title: "Error adding subtask",
        description: "There was an error adding the subtask. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  const handleToggleSubtask = async (subtask: Subtask) => {
    try {
      await toggleSubtaskCompletion.mutateAsync({
        id: subtask.id,
        completed: !subtask.completed,
      });
    } catch (error) {
      toast({
        title: "Error updating subtask",
        description: "There was an error updating the subtask. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  const handleDeleteTask = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully."
      });
      
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "There was an error deleting your task. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
              Edit Task
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter task description" 
                        rows={3} 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Subtasks section */}
              <div>
                <FormLabel>Subtasks</FormLabel>
                <div className="mt-2 space-y-2">
                  {subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center">
                      <Checkbox
                        id={`subtask-${subtask.id}`}
                        checked={subtask.completed}
                        onCheckedChange={() => handleToggleSubtask(subtask)}
                        className="h-4 w-4"
                      />
                      <Input 
                        value={subtask.title}
                        onChange={(e) => 
                          updateSubtask.mutate({ 
                            id: subtask.id, 
                            subtask: { title: e.target.value } 
                          })
                        }
                        className="ml-2 flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSubtask.mutate(subtask.id)}
                        className="h-8 w-8 ml-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex items-center">
                    <Input
                      placeholder="New subtask"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddSubtask}
                      className="ml-2"
                      disabled={!newSubtaskTitle.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
                <div className="flex-1"></div>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTask.isPending || !form.formState.isValid}
                >
                  {updateTask.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              and all associated subtasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
