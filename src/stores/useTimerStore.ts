import { create } from 'zustand';

interface TimerState {
    isRunning: boolean;
    startTime: number | null;
    lastResumeTime: number | null;
    accumulatedTime: number; // Total time elapsed before current run

    activeActivityId: string | null;
    activeModuleName: string | null;

    start: (moduleName: string, activityId: string) => void;
    pause: () => void;
    resume: () => void;
    stop: () => number; // Returns total elapsed seconds
    reset: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    isRunning: false,
    startTime: null,
    lastResumeTime: null,
    accumulatedTime: 0,
    activeActivityId: null,
    activeModuleName: null,

    start: (moduleName, activityId) => {
        set({
            isRunning: true,
            startTime: Date.now(),
            lastResumeTime: Date.now(),
            accumulatedTime: 0,
            activeActivityId: activityId,
            activeModuleName: moduleName
        });
    },

    pause: () => {
        const { isRunning, lastResumeTime, accumulatedTime } = get();
        if (!isRunning || !lastResumeTime) return;

        // Calculate time since last resume and add to accumulated
        const now = Date.now();
        const sessionDuration = now - lastResumeTime;

        set({
            isRunning: false,
            lastResumeTime: null,
            accumulatedTime: accumulatedTime + sessionDuration
        });
    },

    resume: () => {
        const { isRunning } = get();
        if (isRunning) return;

        set({
            isRunning: true,
            lastResumeTime: Date.now(),
        });
    },

    stop: () => {
        const { isRunning, lastResumeTime, accumulatedTime } = get();

        const now = Date.now();
        let totalTime = accumulatedTime;

        if (isRunning && lastResumeTime) {
            totalTime += (now - lastResumeTime);
        }

        set({
            isRunning: false,
            activeActivityId: null,
            activeModuleName: null,
            startTime: null,
            lastResumeTime: null,
            accumulatedTime: 0
        });

        return Math.floor(totalTime / 1000); // Return seconds
    },

    reset: () => set({
        isRunning: false,
        startTime: null,
        lastResumeTime: null,
        accumulatedTime: 0,
        activeActivityId: null,
        activeModuleName: null
    }),
}));
