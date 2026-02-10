import { AppLayout } from '@/components/layout/AppLayout';
import { AgendaTimeline } from '@/components/features/AgendaTimeline';
import { ActiveTimerOverlay } from '@/components/features/ActiveTimerOverlay';

function App() {
  return (
    <AppLayout>
      <div className="py-6 space-y-8 pb-32"> {/* Padding bottom for overlay */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Tempo</h1>
          <p className="text-muted-foreground">
            Acompanhe o treinamento em tempo real e ajuste o cronograma automaticamente.
          </p>
        </div>

        <AgendaTimeline />
      </div>
      <ActiveTimerOverlay />
    </AppLayout>
  )
}

export default App
