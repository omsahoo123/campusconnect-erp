
export type ActivityLogItem = {
    type: 'NEW_STUDENT' | 'NEW_TEACHER' | 'SYSTEM_START';
    payload: {
        name: string;
    };
    timestamp: string;
}
