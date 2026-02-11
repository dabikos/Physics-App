import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Line, Circle, Polygon } from 'react-native-svg'

const MAX_TIME = 6

type EnergyInclineSimulationProps = {
  mass?: number
  height?: number
  angle?: number
}

export function EnergyInclineSimulation({ mass: massProp, height: heightProp, angle: angleProp }: EnergyInclineSimulationProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [mass, setMass] = useState(massProp ?? 2)
  const [height, setHeight] = useState(heightProp ?? 3)
  const [angle, setAngle] = useState(angleProp ?? 25)
  const timeRef = useRef(0)

  useEffect(() => {
    timeRef.current = time
  }, [time])

  useEffect(() => {
    if (massProp != null && massProp !== mass) setMass(massProp)
  }, [massProp])

  useEffect(() => {
    if (heightProp != null && heightProp !== height) setHeight(heightProp)
  }, [heightProp])

  useEffect(() => {
    if (angleProp != null && angleProp !== angle) setAngle(angleProp)
  }, [angleProp])

  useEffect(() => {
    if (!isRunning) return
    const timer = setInterval(() => {
      timeRef.current = Math.min(MAX_TIME, timeRef.current + 0.03)
      setTime(timeRef.current)
    }, 30)
    return () => clearInterval(timer)
  }, [isRunning])

  const rad = (angle * Math.PI) / 180
  const g = 9.8
  const accel = g * Math.sin(rad)
  const distance = 0.5 * accel * time * time
  const rampLength = height / Math.sin(rad)
  const progress = rampLength > 0 ? Math.min(1, distance / rampLength) : 0

  const energyPotential = mass * g * height
  const energyKinetic = Math.max(0, energyPotential - mass * g * (height * (1 - progress)))

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{'\u042d\u043d\u0435\u0440\u0433\u0438\u044f \u043d\u0430 \u043d\u0430\u043a\u043b\u043e\u043d\u043d\u043e\u0439 \u043f\u043b\u043e\u0441\u043a\u043e\u0441\u0442\u0438'}</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsRunning((prev) => !prev)}>
            <Ionicons name={isRunning ? 'pause' : 'play'} size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              setIsRunning(false)
              setTime(0)
              timeRef.current = 0
            }}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.scene}>
        <Svg width="100%" height="100%" viewBox="0 0 300 140">
          <Polygon points="20,120 260,120 260,40" fill="rgba(126,227,199,0.2)" />
          <Line x1="20" y1="120" x2="260" y2="40" stroke="rgba(126,227,199,0.9)" strokeWidth="6" strokeLinecap="round" />
          <Circle
            cx={20 + (240 * progress)}
            cy={120 - (80 * progress)}
            r={10 + mass * 0.6}
            fill="rgba(126,227,199,0.9)"
          />
          <Circle
            cx={20 + (240 * progress)}
            cy={120 - (80 * progress)}
            r={4 + mass * 0.3}
            fill="#F1FFFB"
          />
        </Svg>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.valueLabel}>{`E_p = ${energyPotential.toFixed(1)} \u0414\u0436`}</Text>
        <Text style={styles.valueLabel}>{`E_k = ${energyKinetic.toFixed(1)} \u0414\u0436`}</Text>
        <Text style={styles.valueLabel}>{`a = ${accel.toFixed(2)} \u043c/\u0441\u00b2`}</Text>
      </View>

      <Stepper label={'\u041c\u0430\u0441\u0441\u0430'} value={mass} step={0.5} min={1} max={10} unit={'\u043a\u0433'} onChange={setMass} />
      <Stepper label={'\u0412\u044b\u0441\u043e\u0442\u0430'} value={height} step={0.5} min={1} max={5} unit={'\u043c'} onChange={setHeight} />
      <Stepper label={'\u0423\u0433\u043e\u043b'} value={angle} step={1} min={10} max={45} unit={'\u00b0'} onChange={setAngle} />
    </View>
  )
}

type StepperProps = {
  label: string
  value: number
  step: number
  min: number
  max: number
  unit: string
  onChange: (value: number) => void
}

function Stepper({ label, value, step, min, max, unit, onChange }: StepperProps) {
  const update = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta))
    onChange(Number(next.toFixed(2)))
  }

  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepperButton} onPress={() => update(-step)}>
          <Ionicons name="remove" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{`${value.toFixed(2)} ${unit}`}</Text>
        <TouchableOpacity style={styles.stepperButton} onPress={() => update(step)}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(108,99,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scene: {
    height: 140,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  valueLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  stepper: {
    gap: 6,
  },
  stepperLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
})
