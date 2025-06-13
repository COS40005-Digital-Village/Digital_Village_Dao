"use client"

import { useState, DragEvent, ChangeEvent, FormEvent, useMemo, useEffect } from "react"; // Added useEffect
import {
  FileText,
  Plus,
  ChevronDown,
  Activity, 
  Clock,    
  Users,    
  X, // For close button
  Edit2, // For edit icon
  Filter, // Added Filter icon
  ArrowDownUp, // Added for Sort icon
  UserPlus, // For Claim Task / Assignee related actions
  UserX, // For Unassign action
  Tag, // For category display
  Link as LinkIcon, // For Proposal ID link
  Gift, // For Reward indication
  Trash2 // For Delete Task
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added for priority/status dropdowns
import { Label } from "@/components/ui/label"; // Added Label import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Added DialogClose
  DialogTrigger, // Added DialogTrigger
} from "@/components/ui/dialog"; // Added Dialog components
import { toast } from "sonner"; // Import the toast function

// Import for Proposal Sync
import { mockProposalDatabase, MockProposalDetailData } from "../governance/mockProposal";

// Define Task and Column types (assuming these were implicitly defined or will be needed)
interface Task {
  id: string;
  title: string;
  description: string;
  status: string; // e.g., 'To Do', 'In Progress', 'Done'
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  assignees?: { id: string; name: string; avatar?: string }[];
  tags?: string[];
  progress?: number; // 0-100
  createdAt: number; // Added for potential sorting
  createdBy: string; // User ID of the creator
  // New fields for Phase 2.3, 2.4, 2.5
  category?: string; // e.g., "Bounty", "Core Development"
  proposalId?: string; // e.g., "PROP-001"
  reward?: string; // e.g., "100 DAO Tokens"
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

interface TaskBoardData {
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}

const LOCAL_STORAGE_KEY = "taskBoardData_v1";
const SYSTEM_GENERATED_USER_ID = "SYSTEM_AUTO_GEN";

// Mock Current User for Phase 2.2
const MOCK_CURRENT_USER = {
  id: 'user-mock-current-001',
  name: 'Current Mock User',
  avatar: '/placeholder-avatar-current.jpg' // Example avatar path
};

// Mock other users for assignee examples
const MOCK_OTHER_USERS = [
  { id: 'user-alice-002', name: 'Alice Wonderland', avatar: '/placeholder-avatar-alice.jpg' },
  { id: 'user-bob-003', name: 'Bob The Builder', avatar: '/placeholder-avatar-bob.jpg' },
  { id: 'user-charlie-004', name: 'Charlie Brown', avatar: '/placeholder-avatar-charlie.jpg' },
];

// Initial State for the Task Board (example structure)
const initialTaskBoardData: TaskBoardData = {
  tasks: {
    'task-1': { id: 'task-1', title: 'Design new landing page', description: 'Create mockups for the new DAO platform landing page.', status: 'To Do', priority: 'High', dueDate: '2024-09-15', assignees: [MOCK_OTHER_USERS[0]], tags: ['design', 'UI/UX'], progress: 10, createdAt: Date.now() - 500000, createdBy: MOCK_OTHER_USERS[0].id, category: "Core Development", proposalId: "PROP-001", reward: "500 USDC" },
    'task-2': { id: 'task-2', title: 'Develop smart contract for voting', description: 'Implement the core logic for proposal voting.', status: 'To Do', priority: 'High', dueDate: '2024-10-01', assignees: [], tags: ['blockchain', 'solidity'], progress: 0, createdAt: Date.now() - 400000, createdBy: MOCK_OTHER_USERS[1].id, category: "Core Development", reward: "1 ETH" },
    'task-3': { id: 'task-3', title: 'Set up Discord server', description: 'Configure channels and bots for community.', status: 'In Progress', priority: 'Medium', dueDate: '2024-08-30', assignees: [MOCK_CURRENT_USER, MOCK_OTHER_USERS[2]], tags: ['community'], progress: 60, createdAt: Date.now() - 300000, createdBy: MOCK_CURRENT_USER.id, category: "Community Initiative" },
    'task-5': { id: 'task-5', title: 'User testing for governance module', description: 'Recruit members for testing and feedback.', status: 'In Progress', priority: 'Medium', assignees: [], tags: ['testing', 'ux'], progress: 30, createdAt: Date.now() - 100000, createdBy: MOCK_CURRENT_USER.id, category: "Community Initiative", reward: "Reputation Points" },
  },
  columns: {
    'column-1': { id: 'column-1', title: 'To Do', taskIds: ['task-1', 'task-2'] },
    'column-2': { id: 'column-2', title: 'In Progress', taskIds: ['task-3', 'task-5'] },
    'column-4': { id: 'column-4', title: 'In Review', taskIds: [] },
    'column-3': { id: 'column-3', title: 'Done', taskIds: [] },
  },
  columnOrder: ['column-1', 'column-2', 'column-4', 'column-3'],
};

// Extend Task interface for editing form to handle tags as string
interface EditingTask extends Task {
  tagsString?: string;
}

// Helper to find user name by ID (mock)
const getUserNameById = (userId: string): string => {
  if (userId === MOCK_CURRENT_USER.id) return MOCK_CURRENT_USER.name;
  if (userId === SYSTEM_GENERATED_USER_ID) return "System";
  const otherUser = MOCK_OTHER_USERS.find(u => u.id === userId);
  return otherUser ? otherUser.name : userId; // Fallback to ID if not found
};

// Define Task Categories for Phase 2.3
const TASK_CATEGORIES = [
  "Core Development",
  "Community Initiative",
  "Documentation",
  "Bug Fix",
  "Research",
  "Marketing",
  "Bounty",
  "Design",
  "Governance Action" // Added for system-generated tasks
];

// Helper function to get column background color based on title
const getColumnBackgroundColor = (columnTitle?: string): string => {
  switch (columnTitle) {
    case 'In Progress':
      return 'bg-blue-100/50 dark:bg-blue-900/20';
    case 'In Review':
      return 'bg-yellow-100/50 dark:bg-yellow-900/20';
    case 'Done':
      return 'bg-green-100/50 dark:bg-green-900/20';
    default: // 'To Do' and any other fallback
      return 'bg-muted/50';
  }
};

export default function TaskBoard() {
  const [boardData, setBoardData] = useState<TaskBoardData>(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        try {
          // Basic validation for stored data structure (can be more robust)
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.tasks && parsedData.columns && parsedData.columnOrder) {
            return parsedData;
          }
        } catch (error) {
          console.error("Error parsing board data from localStorage:", error);
        }
      }
    }
    return initialTaskBoardData;
  });
  
  // State for New Task Form Dialog
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskTagsString, setNewTaskTagsString] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<string>(TASK_CATEGORIES[0] || "");
  const [newTaskProposalId, setNewTaskProposalId] = useState<string>("");
  const [newTaskReward, setNewTaskReward] = useState<string>("");
  const [selectedColumnForNewTask, setSelectedColumnForNewTask] = useState<string>(() => {
    const currentBoardData = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY) 
                              ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!) 
                              : initialTaskBoardData;
    return currentBoardData.columnOrder[0] || '';
  });

  // State for Task Detail Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);

  // State for filtering
  const [filterPriority, setFilterPriority] = useState<Task['priority'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all'); // State for category filter

  // State for sorting
  const [sortCriteria, setSortCriteria] = useState<'dueDate' | 'priority' | 'createdAt' | 'none'>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Effect to save boardData to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boardData));
    }
  }, [boardData]);

  // Effect to re-initialize selectedColumnForNewTask if boardData changes from localStorage initially
  // This ensures that if boardData comes from localStorage and has a different column order,
  // the dropdown for new task defaults to the first column of that loaded data.
  useEffect(() => {
    if (boardData && boardData.columnOrder.length > 0) {
      if (!boardData.columnOrder.includes(selectedColumnForNewTask)) {
         setSelectedColumnForNewTask(boardData.columnOrder[0]);
      }
    } else if (initialTaskBoardData.columnOrder.length > 0) { // Fallback if boardData is somehow null/empty from LS
        setSelectedColumnForNewTask(initialTaskBoardData.columnOrder[0]);
    }
  }, [boardData, selectedColumnForNewTask]); // selectedColumnForNewTask is in dependency array to avoid stale closure issues with its own setter

  // Effect to sync executed proposals into tasks
  useEffect(() => {
    const proposalsToSync = Object.values(mockProposalDatabase);
    const existingTaskProposalIds = new Set(Object.values(boardData.tasks).map(task => task.proposalId).filter(Boolean));
    let newTasksGenerated: Task[] = [];

    proposalsToSync.forEach(proposal => {
      if (proposal.metadata.status === "Executed" && proposal.id && !existingTaskProposalIds.has(proposal.id)) {
        const newTaskId = `task-prop-${proposal.id}-${Date.now()}`;
        const targetColumnId = boardData.columnOrder[0]; // Default to first column
        
        if (!targetColumnId || !boardData.columns[targetColumnId]) {
          console.warn(`Cannot create task for proposal ${proposal.id}: Default column not found.`);
          return;
        }

        const newTask = {
          id: newTaskId,
          title: `Action Items: ${proposal.metadata.title}`,
          description: `Auto-generated task for successfully executed proposal: ${proposal.metadata.title} (ID: ${proposal.id}). Review proposal details for required actions.`,
          status: boardData.columns[targetColumnId].title,
          priority: 'Medium' as Task['priority'],
          dueDate: undefined,
          assignees: [],
          tags: ['proposal-action', proposal.metadata.guild?.toLowerCase().replace(/\s+/g, '-') || 'general'],
          progress: 0,
          createdAt: Date.now(),
          createdBy: SYSTEM_GENERATED_USER_ID,
          category: "Governance Action",
          proposalId: proposal.id,
          reward: undefined, // Or map from proposal if relevant
        };
        newTasksGenerated.push(newTask);
      }
    });

    if (newTasksGenerated.length > 0) {
      setBoardData(prevBoardData => {
        const updatedTasks = { ...prevBoardData.tasks };
        const updatedColumns = { ...prevBoardData.columns };
        const targetColumnId = prevBoardData.columnOrder[0];

        if (!targetColumnId || !updatedColumns[targetColumnId]) {
            console.error("Critical error: Default column for new proposal tasks disappeared.");
            // Fallback: just add tasks, they won't appear in a column visually until manual fix
            newTasksGenerated.forEach(task => { updatedTasks[task.id] = task; });
            return { ...prevBoardData, tasks: updatedTasks }; 
        }
        
        const columnToUpdate = { ...updatedColumns[targetColumnId] };
        const newTaskIdsForColumn = newTasksGenerated.map(task => task.id);
        
        columnToUpdate.taskIds = [...columnToUpdate.taskIds, ...newTaskIdsForColumn];
        updatedColumns[targetColumnId] = columnToUpdate;
        newTasksGenerated.forEach(task => { updatedTasks[task.id] = task; });

        return {
          ...prevBoardData,
          tasks: updatedTasks,
          columns: updatedColumns,
        };
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount, after initial boardData is loaded from localStorage or defaults

  const priorityOrder: Record<Task['priority'], number> = {
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const handleOpenDetailModal = (taskId: string) => {
    const task = boardData.tasks[taskId];
    if (task) {
      setSelectedTaskForDetail(task);
      setEditingTask({ 
        ...task, 
        tagsString: task.tags?.join(', ') || '' 
      });
      setIsDetailModalOpen(true);
    }
  };

  const handleTaskInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingTask) return;
    const { name, value } = e.target;
    if (name === "progress") {
        const numValue = value === '' ? undefined : parseInt(value, 10);
        setEditingTask(prev => prev ? { ...prev, [name]: isNaN(numValue as any) ? undefined : numValue } : null);
    } else {
        setEditingTask(prev => prev ? { ...prev, [name]: value } : null);
    }
  };
  
  const handleTaskPriorityChange = (value: string) => {
    if (!editingTask) return;
    setEditingTask(prev => prev ? { ...prev, priority: value as Task['priority'] } : null);
  };
  
  const handleTaskTagsChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!editingTask) return;
    setEditingTask(prev => prev ? { ...prev, tagsString: e.target.value } : null);
  };
  
  const handleTaskCategoryChange = (value: string) => {
    if (!editingTask) return;
    setEditingTask(prev => prev ? { ...prev, category: value } : null);
  };

  const handleTaskStatusChange = (newStatusTitle: string) => {
    if (!editingTask) return;
    setEditingTask(prev => prev ? { ...prev, status: newStatusTitle } : null);
  };

  const handleSaveTaskDetails = (e: FormEvent) => {
    e.preventDefault();
    if (!editingTask || !selectedTaskForDetail) {
      console.error("Save error: editingTask or selectedTaskForDetail is null.");
      toast.error("Failed to save task. An unexpected error occurred.");
      setIsDetailModalOpen(false);
      return;
    }

    const taskToSave: Task = {
        ...editingTask,
        tags: (editingTask.tagsString || '').split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag !== ''),
        category: editingTask.category || TASK_CATEGORIES[0],
        proposalId: editingTask.proposalId || undefined,
        reward: editingTask.reward || undefined
    };
    delete (taskToSave as Partial<EditingTask>).tagsString;

    setBoardData(prev => {
      const updatedTasks = {
        ...prev.tasks,
        [taskToSave.id]: taskToSave,
      };
      let updatedColumns = { ...prev.columns };

      const originalStatusOnModalOpen = selectedTaskForDetail.status;
      const newFinalStatus = taskToSave.status;

      if (originalStatusOnModalOpen !== newFinalStatus) {
        let currentColumnIdContainingTask: string | undefined;
        for (const colId in prev.columns) {
          if (prev.columns[colId].taskIds.includes(taskToSave.id)) {
            currentColumnIdContainingTask = colId;
            break;
          }
        }

        const targetColumnIdForNewStatus = Object.keys(prev.columns).find(
          (colId) => prev.columns[colId].title === newFinalStatus
        );

        if (currentColumnIdContainingTask && targetColumnIdForNewStatus && currentColumnIdContainingTask !== targetColumnIdForNewStatus) {
          // Move from source to destination column
          const sourceColTaskIds = prev.columns[currentColumnIdContainingTask].taskIds.filter(id => id !== taskToSave.id);
          const destColTaskIds = [...prev.columns[targetColumnIdForNewStatus].taskIds, taskToSave.id];
          
          updatedColumns = {
            ...updatedColumns,
            [currentColumnIdContainingTask]: { ...prev.columns[currentColumnIdContainingTask], taskIds: sourceColTaskIds },
            [targetColumnIdForNewStatus]: { ...prev.columns[targetColumnIdForNewStatus], taskIds: destColTaskIds },
          };
        } else if (!currentColumnIdContainingTask && targetColumnIdForNewStatus) {
          // Task was not in a column, but now should be added to target column
          const destColTaskIds = [...prev.columns[targetColumnIdForNewStatus].taskIds, taskToSave.id];
          updatedColumns = {
            ...updatedColumns,
            [targetColumnIdForNewStatus]: { ...prev.columns[targetColumnIdForNewStatus], taskIds: destColTaskIds },
          };
        } else if (currentColumnIdContainingTask && !targetColumnIdForNewStatus) {
          // Task was in a column, but new status doesn't map to any column (remove from old column)
          const sourceColTaskIds = prev.columns[currentColumnIdContainingTask].taskIds.filter(id => id !== taskToSave.id);
          updatedColumns = {
            ...updatedColumns,
            [currentColumnIdContainingTask]: { ...prev.columns[currentColumnIdContainingTask], taskIds: sourceColTaskIds },
          };
        }
        // If currentColumnIdContainingTask === targetColumnIdForNewStatus, no change to taskIds in columns needed.
        // The task's status field itself is updated via updatedTasks.
      }

      return {
        ...prev,
        tasks: updatedTasks,
        columns: updatedColumns,
      };
    });

    // Close modals and perform side effect (toast)
    setIsDetailModalOpen(false);
    setSelectedTaskForDetail(null);
    setEditingTask(null);
    toast.success("Task details saved successfully!");
  };

  const handleAddTask = (event: FormEvent) => {
    event.preventDefault();
    if (!newTaskTitle.trim() || !selectedColumnForNewTask) {
      if(!selectedColumnForNewTask && boardData.columnOrder.length > 0) {
        setSelectedColumnForNewTask(boardData.columnOrder[0]);
        alert("Please select a column for the new task.");
        return;
      }
      if(!selectedColumnForNewTask) {
        alert("No columns available to add tasks. Please check board configuration.");
        return;
      }
      return;
    }
    const newTaskId = `task-${Date.now()}`;
    const newTags = newTaskTagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    const newTask: Task = {
      id: newTaskId,
      title: newTaskTitle,
      description: newTaskDescription,
      status: boardData.columns[selectedColumnForNewTask]?.title || 'To Do',
      priority: newTaskPriority, 
      dueDate: newTaskDueDate || undefined,
      tags: newTags,
      progress: 0,
      createdAt: Date.now(),
      createdBy: MOCK_CURRENT_USER.id,
      assignees: [],
      category: newTaskCategory || TASK_CATEGORIES[0],
      proposalId: newTaskProposalId.trim() || undefined,
      reward: newTaskReward.trim() || undefined,
    };

    setBoardData(prev => {
      const newTasks = { ...prev.tasks, [newTaskId]: newTask };
      const column = prev.columns[selectedColumnForNewTask];
      if (!column) {
        console.error("Selected column for new task not found, defaulting to first column if available.");
        const firstColumnId = prev.columnOrder[0];
        if(firstColumnId && prev.columns[firstColumnId]){
            const fallbackColumn = prev.columns[firstColumnId];
            const newTaskIds = Array.from(fallbackColumn.taskIds);
            newTaskIds.push(newTaskId);
            const newFallbackColumn = { ...fallbackColumn, taskIds: newTaskIds };
            return {
                ...prev,
                tasks: newTasks,
                columns: {
                    ...prev.columns,
                    [firstColumnId]: newFallbackColumn,
                },
            };
        }
        return prev; 
      }
      const newTaskIds = Array.from(column.taskIds);
      newTaskIds.push(newTaskId); 
      const newColumn = { ...column, taskIds: newTaskIds };
      return {
        ...prev,
        tasks: newTasks,
        columns: {
          ...prev.columns,
          [selectedColumnForNewTask]: newColumn,
        },
      };
    });
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority('Medium');
    setNewTaskDueDate("");
    setNewTaskTagsString("");
    setNewTaskCategory(TASK_CATEGORIES[0] || "");
    setNewTaskProposalId("");
    setNewTaskReward("");
    setIsAddTaskModalOpen(false);
    toast.success("Task created successfully!");
  };
  
  const onDragStart = (event: DragEvent<HTMLDivElement>, taskId: string) => {
    event.dataTransfer.setData("taskId", taskId);
    event.currentTarget.classList.add('opacity-50', 'scale-95');
  };

  const onDragEnd = (event: DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('opacity-50', 'scale-95');
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, columnId: string) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("taskId");
    const destinationColumn = boardData.columns[columnId];
    event.currentTarget.classList.remove('bg-primary/10');
    
    let sourceColumnId: string | undefined;
    for (const colId in boardData.columns) {
      if (boardData.columns[colId].taskIds.includes(taskId)) {
        sourceColumnId = colId;
        break;
      }
    }

    if (!sourceColumnId || sourceColumnId === columnId) {
      return; 
    }

    const finalSourceColumnId = sourceColumnId;

    setBoardData(prev => {
      const task = prev.tasks[taskId];
      const sourceColumn = prev.columns[finalSourceColumnId!];
      const destinationColumn = prev.columns[columnId];

      // Ensure all parts are valid before proceeding
      if (!task || !sourceColumn || !destinationColumn) {
        console.error("Drag and drop error: task or column not found in state.", {taskId, finalSourceColumnId, columnId });
        return prev; // Return previous state if something is unexpectedly missing
      }

      // The toast call is a side effect and should be outside the state updater.
      // We'll call it in the onDrop handler after setBoardData.
      return {
        ...prev,
        tasks: {
          ...prev.tasks,
          [taskId]: {
            ...task,
            status: destinationColumn.title 
          }
        },
        columns: {
          ...prev.columns,
          [finalSourceColumnId!]: {
            ...sourceColumn,
            taskIds: sourceColumn.taskIds.filter(id => id !== taskId)
          },
          [columnId]: {
            ...destinationColumn,
            taskIds: [...destinationColumn.taskIds, taskId]
          }
        }
      };
    });

    // Perform side effect (toast) after state update
    if (destinationColumn) {
      toast.info(`Task moved to "${destinationColumn.title}".`);
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault(); 
    event.currentTarget.classList.add('bg-primary/10');
  };

  const onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('bg-primary/10');
  };

  // Task Deletion Handler
  const handleDeleteTask = (taskIdToDelete: string) => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      setBoardData(prevBoardData => {
        const newTasks = { ...prevBoardData.tasks };
        delete newTasks[taskIdToDelete];

        const newColumns = { ...prevBoardData.columns };
        // Remove the taskId from whichever column it was in
        for (const columnId in newColumns) {
          newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(id => id !== taskIdToDelete);
        }

        return {
          ...prevBoardData,
          tasks: newTasks,
          columns: newColumns,
        };
      });
      // Perform side effect (toast) after state update
      toast.error("Task has been deleted.");
    }
  };

  // Memoize filtered tasks to prevent re-filtering on every render unless dependencies change
  const filteredAndSortedTasksByColumn = useMemo(() => {
    const result: Record<string, Task[]> = {};
    if (!boardData || !boardData.columnOrder || !boardData.columns || !boardData.tasks) {
        (initialTaskBoardData.columnOrder || []).forEach(colId => result[colId] = []);
        return result;
    }

    boardData.columnOrder.forEach(columnId => {
      const column = boardData.columns[columnId];
      if (!column) {
        result[columnId] = [];
        return;
      }
      let tasks = column.taskIds.map(taskId => boardData.tasks[taskId]).filter(Boolean as unknown as (value: Task | undefined) => value is Task);
      
      if (filterPriority !== 'all') {
        tasks = tasks.filter(task => task.priority === filterPriority);
      }

      if (filterCategory !== 'all') { // Add category filtering
        tasks = tasks.filter(task => task.category === filterCategory);
      }

      if (sortCriteria !== 'none') {
        tasks.sort((a, b) => {
          let valA: any;
          let valB: any;

          if (sortCriteria === 'priority') {
            valA = priorityOrder[a.priority];
            valB = priorityOrder[b.priority];
          } else if (sortCriteria === 'dueDate') {
            // Handle undefined or empty due dates by sorting them last (or first, depending on preference)
            valA = a.dueDate ? new Date(a.dueDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
            valB = b.dueDate ? new Date(b.dueDate).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
          } else if (sortCriteria === 'createdAt') {
            valA = a.createdAt;
            valB = b.createdAt;
          }

          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      result[columnId] = tasks;
    });
    return result;
  }, [boardData, filterPriority, filterCategory, sortCriteria, sortDirection, priorityOrder]);

  // Utility function for assignment toasts to avoid repetition
  const showAssignmentToast = (isAssigning: boolean) => {
    if (isAssigning) {
      toast.success("You have been assigned to the task.");
    } else {
      toast.info("You have been unassigned from the task.");
    }
  };

  const handleToggleAssignCurrentUser = (taskId: string, isAssigning: boolean) => {
    setBoardData(prevBoardData => {
      const taskToUpdate = prevBoardData.tasks[taskId];
      if (!taskToUpdate) return prevBoardData;

      let newAssignees = [...(taskToUpdate.assignees || [])];

      if (isAssigning) {
        if (!newAssignees.find(a => a.id === MOCK_CURRENT_USER.id)) {
          newAssignees.push(MOCK_CURRENT_USER);
        }
      } else {
        newAssignees = newAssignees.filter(a => a.id !== MOCK_CURRENT_USER.id);
      }

      return {
        ...prevBoardData,
        tasks: {
          ...prevBoardData.tasks,
          [taskId]: { ...taskToUpdate, assignees: newAssignees },
        },
      };
    });

    // Perform side effect (toast) after state update
    showAssignmentToast(isAssigning);
  };

  const handleToggleAssignCurrentUserInModal = (isAssigning: boolean) => {
    if (!editingTask) return;
    setEditingTask(prevEditingTask => {
      if (!prevEditingTask) return null;
      let newAssignees = [...(prevEditingTask.assignees || [])];
      if (isAssigning) {
        if (!newAssignees.find(a => a.id === MOCK_CURRENT_USER.id)) {
          newAssignees.push(MOCK_CURRENT_USER);
        }
      } else {
        newAssignees = newAssignees.filter(a => a.id !== MOCK_CURRENT_USER.id);
      }
      return { ...prevEditingTask, assignees: newAssignees };
    });

    // Perform side effect (toast) after state update
    showAssignmentToast(isAssigning);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Board</h2>
          <p className="text-sm text-muted-foreground">Manage project tasks, track progress, and collaborate. Current User: {MOCK_CURRENT_USER.name}</p>
        </div>
        <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Fill in the details below to create a new task.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTask} className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-task-title-modal">Task Title</Label>
                  <Input
                    id="new-task-title-modal"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-task-column-modal">Column (Status)</Label>
                  <Select 
                    value={selectedColumnForNewTask} 
                    onValueChange={setSelectedColumnForNewTask}
                    disabled={!boardData.columnOrder || boardData.columnOrder.length === 0}
                  >
                    <SelectTrigger id="new-task-column-modal">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {(boardData.columnOrder || []).map(colId => (
                        <SelectItem key={colId} value={colId}>
                          {boardData.columns[colId]?.title || 'Unnamed Column'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="new-task-description-modal">Description</Label>
                <Textarea 
                  id="new-task-description-modal"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Enter task description..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="new-task-priority-modal">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as Task['priority'])}>
                    <SelectTrigger id="new-task-priority-modal">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-task-due-date-modal">Due Date</Label>
                  <Input 
                    id="new-task-due-date-modal" 
                    type="date" 
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="new-task-category-modal">Category</Label>
                  <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                    <SelectTrigger id="new-task-category-modal">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="new-task-tags-modal">Tags (comma-separated)</Label>
                  <Input 
                    id="new-task-tags-modal"
                    value={newTaskTagsString}
                    onChange={(e) => setNewTaskTagsString(e.target.value)}
                    placeholder="e.g., design, frontend"
                  />
                </div>
                <div>
                  <Label htmlFor="new-task-proposal-id-modal">Proposal ID (Optional)</Label>
                  <Input 
                    id="new-task-proposal-id-modal"
                    value={newTaskProposalId}
                    onChange={(e) => setNewTaskProposalId(e.target.value)}
                    placeholder="e.g., PROP-001"
                  />
                </div>
                <div>
                  <Label htmlFor="new-task-reward-modal">Reward (Optional)</Label>
                  <Input 
                    id="new-task-reward-modal"
                    value={newTaskReward}
                    onChange={(e) => setNewTaskReward(e.target.value)}
                    placeholder="e.g., 100 DAO Tokens"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={!newTaskTitle.trim() || !selectedColumnForNewTask}> 
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filter & Sorting Controls Card */}
      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center"><Filter className="mr-2 h-4 w-4 text-muted-foreground"/> Filters & Sorting</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                    <Label htmlFor="filter-priority">Filter By Priority</Label>
                    <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as Task['priority'] | 'all')}>
                        <SelectTrigger id="filter-priority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="filter-category">Filter By Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger id="filter-category">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {TASK_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="sort-criteria">Sort By</Label>
                    <Select value={sortCriteria} onValueChange={(value) => setSortCriteria(value as 'dueDate' | 'priority' | 'createdAt' | 'none')}>
                        <SelectTrigger id="sort-criteria">
                            <SelectValue placeholder="Select criteria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="createdAt">Creation Date</SelectItem>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="sort-direction">Direction</Label>
                     <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}>
                        <SelectTrigger id="sort-direction">
                            <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
      </Card>
      
      {/* Task Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {(boardData.columnOrder || []).map((columnId) => {
          const column = boardData.columns[columnId];
          const tasksInColumn = filteredAndSortedTasksByColumn[columnId] || [];

          return (
            <div 
              key={column?.id || columnId} 
              className="w-80 flex-shrink-0"
              onDrop={(e) => onDrop(e, column.id)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            >
              <Card className={`h-full ${getColumnBackgroundColor(column?.title)}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex justify-between items-center">
                    {column?.title || 'Unnamed Column'}
                    <Badge variant="secondary">{tasksInColumn.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 min-h-[200px]">
                  {tasksInColumn.map((task) => (
                    <Card 
                      key={task.id} 
                      className="bg-background shadow-sm cursor-grab"
                      draggable 
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onDragEnd={onDragEnd}
                    >
                      <CardHeader className="p-3 pb-1">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                          {task.category && (
                            <Badge variant="outline" className="text-xs flex items-center ml-2 whitespace-nowrap">
                              <Tag className="mr-1 h-3 w-3" /> {task.category}
                            </Badge>
                          )}
                        </div>
                         <Badge 
                            variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'secondary' : 'outline'}
                            className="text-xs capitalize mt-1"
                          >
                            {task.priority}
                          </Badge>
                      </CardHeader>
                      <CardContent className="p-3 pt-1 text-xs text-muted-foreground">
                        {task.description && <p className="line-clamp-2 mb-2">{task.description}</p>}
                        {task.reward && (
                          <div className="flex items-center gap-1 mb-1 font-medium text-primary">
                            <Gift className="h-3 w-3" /> Reward: {task.reward}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-destructive/80 mb-1">
                            <Clock className="h-3 w-3" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {task.proposalId && (
                          <div className="flex items-center gap-1 mb-1">
                            <LinkIcon className="h-3 w-3" /> Linked Proposal: {task.proposalId}
                          </div>
                        )}
                        {task.assignees && task.assignees.length > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Users className="h-3 w-3" />
                            <div className="flex -space-x-2 overflow-hidden">
                              {task.assignees.map(assignee => (
                                <Avatar key={assignee.id} className="h-5 w-5 border-2 border-background" title={assignee.name}>
                                  <AvatarImage src={assignee.avatar} />
                                  <AvatarFallback>{assignee.name?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                        )}
                        {task.tags && task.tags.length > 0 && (
                           <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        {task.progress !== undefined && (
                          <div>
                            <Progress value={task.progress} className="h-1.5 w-full" />
                            <p className="text-xs text-right mt-0.5">{task.progress}%</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground/80 mt-2">Created: {new Date(task.createdAt).toLocaleDateString()} by {getUserNameById(task.createdBy)}</p>
                      </CardContent>
                      <CardFooter className="p-3 pt-0 flex flex-col items-stretch gap-2">
                         <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleOpenDetailModal(task.id)}>
                           <Edit2 className="mr-1 h-3 w-3" /> View/Edit Details
                         </Button>
                         {(!task.assignees || task.assignees.length === 0) && (
                           <Button variant="secondary" size="sm" className="w-full text-xs" onClick={() => handleToggleAssignCurrentUser(task.id, true)}>
                             <UserPlus className="mr-1 h-3 w-3" /> Claim Task
                           </Button>
                         )}
                         {(task.assignees && task.assignees.find(a => a.id === MOCK_CURRENT_USER.id)) && (
                           <Button variant="destructive" size="sm" className="w-full text-xs" onClick={() => handleToggleAssignCurrentUser(task.id, false)}>
                             <UserX className="mr-1 h-3 w-3" /> Unassign Me
                           </Button>
                         )}
                         <Button variant="ghost" size="sm" className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="mr-1 h-3 w-3" /> Delete Task
                         </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {tasksInColumn.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-10 border-2 border-dashed border-border rounded-md">
                      No tasks in this column.
                      {(filterPriority !== 'all' || filterCategory !== 'all' || sortCriteria !== 'none') && 
                        <p className="text-xs mt-1">
                            {filterPriority !== 'all' && `(Priority: ${filterPriority}) `}
                            {filterCategory !== 'all' && `(Category: ${filterCategory}) `}
                            {sortCriteria !== 'none' && ` (Sort: ${sortCriteria} ${sortDirection})`}
                        </p>
                      }
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTaskForDetail && editingTask && (
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSaveTaskDetails} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Task Details: {editingTask.title}</DialogTitle>
                <DialogDescription>
                  View and edit the details of this task. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title-detail" className="text-right">Title</Label>
                  <Input id="title-detail" name="title" value={editingTask.title} onChange={handleTaskInputChange} className="col-span-3" required/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description-detail" className="text-right pt-2">Description</Label>
                  <Textarea id="description-detail" name="description" value={editingTask.description} onChange={handleTaskInputChange} className="col-span-3 min-h-[100px]" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority-detail" className="text-right">Priority</Label>
                  <Select name="priority" value={editingTask.priority} onValueChange={handleTaskPriorityChange}>
                    <SelectTrigger id="priority-detail" className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status-detail" className="text-right">Status / Column</Label>
                  <Select name="status" value={editingTask.status} onValueChange={handleTaskStatusChange}>
                    <SelectTrigger id="status-detail" className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {boardData.columnOrder.map(columnId => {
                        const column = boardData.columns[columnId];
                        return (
                          <SelectItem key={columnId} value={column.title}>
                            {column.title}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate-detail" className="text-right">Due Date</Label>
                  <Input id="dueDate-detail" name="dueDate" type="date" value={editingTask.dueDate || ''} onChange={handleTaskInputChange} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-detail" className="text-right">Category</Label>
                  <Select name="category" value={editingTask.category || TASK_CATEGORIES[0]} onValueChange={handleTaskCategoryChange}>
                    <SelectTrigger id="category-detail" className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tagsString-detail" className="text-right">Tags</Label>
                  <Input id="tagsString-detail" name="tagsString" value={editingTask.tagsString || ''} onChange={handleTaskTagsChange} className="col-span-3" placeholder="e.g., design, frontend, bug"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="proposalId-detail" className="text-right">Proposal ID</Label>
                  <Input id="proposalId-detail" name="proposalId" value={editingTask.proposalId || ''} onChange={handleTaskInputChange} className="col-span-3" placeholder="e.g., PROP-001 (Optional)"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reward-detail" className="text-right">Reward</Label>
                  <Input id="reward-detail" name="reward" value={editingTask.reward || ''} onChange={handleTaskInputChange} className="col-span-3" placeholder="e.g., 100 DAO Tokens (Optional)"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="progress-detail" className="text-right">Progress</Label>
                  <Input id="progress-detail" name="progress" type="number" min="0" max="100" value={editingTask.progress === undefined ? '' : editingTask.progress} onChange={handleTaskInputChange} className="col-span-3" placeholder="0-100"/>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="assignees-detail" className="text-right pt-2">Assignees</Label>
                  <div className="col-span-3 space-y-2">
                    {editingTask.assignees && editingTask.assignees.length > 0 ? (
                      <div className="flex flex-wrap gap-2 items-center">
                        {editingTask.assignees.map(assignee => (
                          <Badge key={assignee.id} variant="secondary" className="flex items-center gap-1 pr-1">
                            <Avatar className="h-4 w-4 mr-1">
                              <AvatarImage src={assignee.avatar} />
                              <AvatarFallback>{assignee.name?.substring(0,1).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            {assignee.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No one assigned yet.</p>
                    )}
                    {!editingTask.assignees?.find(a => a.id === MOCK_CURRENT_USER.id) ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleToggleAssignCurrentUserInModal(true)}>
                        <UserPlus className="mr-2 h-4 w-4" /> Assign to Me
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleToggleAssignCurrentUserInModal(false)}>
                        <UserX className="mr-2 h-4 w-4" /> Unassign Me
                      </Button>
                    )}
                  </div>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="createdBy-detail" className="text-right">Created By</Label>
                  <Input id="createdBy-detail" name="createdBy" type="text" value={getUserNameById(editingTask.createdBy) + ` (${editingTask.createdBy})`} className="col-span-3" readOnly disabled/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="createdAt-detail" className="text-right">Created At</Label>
                  <Input id="createdAt-detail" name="createdAt" type="text" value={new Date(editingTask.createdAt).toLocaleString()} className="col-span-3" readOnly disabled/>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 
