import './ModeSwitch.css'

export type AppMode = 'command' | 'workshop'

interface ModeSwitchProps {
  mode: AppMode
  onChange: (mode: AppMode) => void
}

const OPTIONS: { value: AppMode; label: string }[] = [
  { value: 'command', label: 'Modo Comando' },
  { value: 'workshop', label: 'Modo Oficina' },
]

export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="group" aria-label="Modo de operação">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className="mode-switch-option"
          aria-pressed={mode === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
