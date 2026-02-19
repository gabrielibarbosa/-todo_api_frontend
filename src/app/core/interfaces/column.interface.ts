import { Task } from "./task.interface";

export interface Column {
    id: string;
    name: string;
    position: number;
    boardId: string;
    tasks?: Task[]
}