import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { Agenda, DEFAULT_AGENDA_MARKDOWN, parseMarkdownAgenda } from '@/lib/agenda-parser';
import { shiftTime } from '@/lib/time-utils';

interface AgendaState {
    agenda: Agenda;
    currentModule: string;
    totalVariation: number; // in seconds

    // Actions
    loadAgenda: (markdown?: string) => void;
    setAgenda: (agenda: Agenda) => void;
    setModule: (moduleName: string) => void;
    startActivity: (moduleName: string, activityId: string) => void;
    restartActivity: (moduleName: string, activityId: string) => void;
    completeActivity: (moduleName: string, activityId: string, realDuration: number) => void;
    updateVariation: () => void;
    reset: () => void;
}

export const useAgendaStore = create<AgendaState>()(
    persist(
        (set) => ({
            agenda: parseMarkdownAgenda(DEFAULT_AGENDA_MARKDOWN),
            currentModule: 'Módulo I',
            totalVariation: 0,

            loadAgenda: (markdown) => {
                const data = parseMarkdownAgenda(markdown || DEFAULT_AGENDA_MARKDOWN);
                set({ agenda: data, totalVariation: 0 });
            },

            setAgenda: (agenda: Agenda) => set({ agenda, totalVariation: 0 }),

            setModule: (moduleName) => set({ currentModule: moduleName }),

            startActivity: (moduleName, activityId) => {
                set((state) => {
                    const newModules = { ...state.agenda.modules };
                    if (!newModules[moduleName]) return state;

                    const activities = [...newModules[moduleName]];
                    const activityIndex = activities.findIndex(a => a.id === activityId);

                    if (activityIndex === -1) return state;

                    const now = new Date();
                    const realStart = format(now, 'HH:mm:ss');

                    activities[activityIndex] = {
                        ...activities[activityIndex],
                        status: 'running',
                        realStart: realStart
                    };

                    newModules[moduleName] = activities;

                    return { agenda: { ...state.agenda, modules: newModules } };
                });
            },

            restartActivity: (moduleName, activityId) => {
                set((state) => {
                    const newModules = { ...state.agenda.modules };
                    if (!newModules[moduleName]) return state;

                    const activities = [...newModules[moduleName]];
                    const activityIndex = activities.findIndex(a => a.id === activityId);

                    if (activityIndex === -1) return state;

                    const activity = activities[activityIndex];
                    if (activity.status !== 'completed') return state;

                    // Parse variation from string like "+00:05:00" or "-00:02:00"
                    let variationSeconds = 0;
                    if (activity.variation) {
                        const sign = activity.variation.startsWith('+') ? 1 : -1;
                        const [vh, vm, vs] = activity.variation.substring(1).split(':').map(Number);
                        variationSeconds = sign * ((vh * 3600) + (vm * 60) + vs);
                    }

                    // Revert status and clear real times
                    activities[activityIndex] = {
                        ...activity,
                        status: 'pending',
                        realStart: undefined,
                        realEnd: undefined,
                        realDuration: undefined,
                        variation: undefined
                    };

                    // REVERSE the schedule shift for ALL future activities
                    const reverseShift = -variationSeconds;

                    // Shift future activities in THIS module
                    for (let i = activityIndex + 1; i < activities.length; i++) {
                        activities[i] = {
                            ...activities[i],
                            plannedStart: shiftTime(activities[i].plannedStart, reverseShift),
                            plannedEnd: shiftTime(activities[i].plannedEnd, reverseShift)
                        };
                    }

                    newModules[moduleName] = activities;

                    // Shift activities in FUTURE modules
                    const moduleNames = Object.keys(newModules).sort();
                    const currentModIdx = moduleNames.indexOf(moduleName);
                    if (currentModIdx !== -1) {
                        for (let j = currentModIdx + 1; j < moduleNames.length; j++) {
                            const nextModName = moduleNames[j];
                            newModules[nextModName] = newModules[nextModName].map(act => ({
                                ...act,
                                plannedStart: shiftTime(act.plannedStart, reverseShift),
                                plannedEnd: shiftTime(act.plannedEnd, reverseShift)
                            }));
                        }
                    }

                    return {
                        agenda: { ...state.agenda, modules: newModules },
                        totalVariation: state.totalVariation - variationSeconds
                    };
                });
            },

            completeActivity: (moduleName, activityId, realDurationSeconds) => {
                set((state) => {
                    const newModules = { ...state.agenda.modules };
                    if (!newModules[moduleName]) return state;

                    const activities = [...newModules[moduleName]];
                    const activityIndex = activities.findIndex(a => a.id === activityId);

                    if (activityIndex === -1) return state;

                    const activity = activities[activityIndex];
                    const now = new Date();
                    const realEnd = format(now, 'HH:mm:ss');

                    const [ph, pm, ps] = activity.plannedDuration.split(':').map(Number);
                    const plannedSeconds = (ph * 3600) + (pm * 60) + ps;

                    const variationSeconds = realDurationSeconds - plannedSeconds;
                    const variationSign = variationSeconds >= 0 ? "+" : "-";
                    const absVariation = Math.abs(variationSeconds);
                    const vh = Math.floor(absVariation / 3600);
                    const vm = Math.floor((absVariation % 3600) / 60);
                    const vs = absVariation % 60;
                    const variationString = variationSign +
                        String(vh).padStart(2, '0') + ":" +
                        String(vm).padStart(2, '0') + ":" +
                        String(vs).padStart(2, '0');

                    activities[activityIndex] = {
                        ...activity,
                        status: 'completed',
                        realEnd,
                        realDuration: new Date(realDurationSeconds * 1000).toISOString().slice(11, 19),
                        variation: variationString
                    };

                    // Automatic schedule adjustment: Shift all future activities in THIS module
                    for (let i = activityIndex + 1; i < activities.length; i++) {
                        activities[i] = {
                            ...activities[i],
                            plannedStart: shiftTime(activities[i].plannedStart, variationSeconds),
                            plannedEnd: shiftTime(activities[i].plannedEnd, variationSeconds)
                        };
                    }

                    newModules[moduleName] = activities;

                    // Shift activities in FUTURE modules
                    const moduleNames = Object.keys(newModules).sort();
                    const currentModIdx = moduleNames.indexOf(moduleName);
                    if (currentModIdx !== -1) {
                        for (let j = currentModIdx + 1; j < moduleNames.length; j++) {
                            const nextModName = moduleNames[j];
                            newModules[nextModName] = newModules[nextModName].map(act => ({
                                ...act,
                                plannedStart: shiftTime(act.plannedStart, variationSeconds),
                                plannedEnd: shiftTime(act.plannedEnd, variationSeconds)
                            }));
                        }
                    }

                    return {
                        agenda: { ...state.agenda, modules: newModules },
                        totalVariation: state.totalVariation + variationSeconds
                    };
                });
            },

            updateVariation: () => { },
            reset: () => set({
                agenda: parseMarkdownAgenda(DEFAULT_AGENDA_MARKDOWN),
                totalVariation: 0,
                currentModule: 'Módulo I'
            }),
        }),
        {
            name: 'agenda-storage',
        }
    )
);
