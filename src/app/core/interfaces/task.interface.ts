export interface Task {
    id: string;
    name: string;
    position: number;
    createdAt: string;
    dueDate: string;
    completed: boolean;
    tags: string[];
    columnId: string;
}