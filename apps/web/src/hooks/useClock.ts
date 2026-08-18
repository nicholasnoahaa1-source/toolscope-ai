import { useEffect, useState } from 'react'

export interface ClockValue {
  time: string
  date: string
}

function format(now: Date): ClockValue {
  return {
    time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }),
  }
}

export function useClock(): ClockValue {
  const [value, setValue] = useState(() => format(new Date()))

  useEffect(() => {
    const id = window.setInterval(() => setValue(format(new Date())), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return value
}
