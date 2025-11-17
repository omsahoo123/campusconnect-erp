
export type StudentDeadlines = {
    [studentId: string]: {
        id: string;
        subject: string;
        title: string;
        dueDate: string; // ISO string
        document?: string;
        documentName?: string;
    }[];
};
