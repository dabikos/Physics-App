import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const MAX_TIME = 8
const CAR_WIDTH = 56
const CAR_HEIGHT = 26

type UniformAccelerationSimulationProps = {
  v0?: number
  accel?: number
  timeScale?: number
}

export function UniformAccelerationSimulation({ v0: v0Prop, accel: accelProp, timeScale: timeScaleProp }: UniformAccelerationSimulationProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [v0, setV0] = useState(v0Prop ?? 2)
  const [accel, setAccel] = useState(accelProp ?? 1)
  const [timeScale, setTimeScale] = useState(timeScaleProp ?? 1)
  const [trackWidth, setTrackWidth] = useState(0)
  const timeRef = useRef(0)

  useEffect(() => {
    timeRef.current = time
  }, [time])

  useEffect(() => {
    if (v0Prop != null && v0Prop !== v0) setV0(v0Prop)
  }, [v0, v0Prop])

  useEffect(() => {
    if (accelProp != null && accelProp !== accel) setAccel(accelProp)
  }, [accel, accelProp])

  useEffect(() => {
    if (timeScaleProp != null && timeScaleProp !== timeScale) setTimeScale(timeScaleProp)
  }, [timeScale, timeScaleProp])

  useEffect(() => {
    if (!isRunning) return
    const timer = setInterval(() => {
      timeRef.current = Math.min(MAX_TIME, timeRef.current + 0.03 * timeScale)
      setTime(timeRef.current)
    }, 30)
    return () => clearInterval(timer)
  }, [isRunning, timeScale])

  const distance = useMemo(() => v0 * time + 0.5 * accel * time * time, [v0, accel, time])
  const maxDistance = useMemo(() => v0 * MAX_TIME + 0.5 * accel * MAX_TIME * MAX_TIME, [v0, accel])

  const progress = maxDistance > 0 ? Math.min(1, Math.max(0, distance / maxDistance)) : 0
  const carX = Math.max(0, Math.min((trackWidth - CAR_WIDTH), progress * (trackWidth - CAR_WIDTH)))

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{'\u0420\u0430\u0432\u043d\u043e\u0443\u0441\u043a\u043e\u0440\u0435\u043d\u043d\u043e\u0435 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435'}</Text>
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

      <View
        style={styles.track}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <View style={[styles.car, { transform: [{ translateX: carX }] }]} />
        <View style={styles.trackLine} />
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.valueLabel}>{'\u0441'}: {time.toFixed(2)} {'\u0441'}</Text>
        <Text style={styles.valueLabel}>{'\u0432'}: {(v0 + accel * time).toFixed(2)} {'\u043c/\u0441'}</Text>
        <Text style={styles.valueLabel}>{'\u0430'}: {accel.toFixed(2)} {'\u043c/\u0441\u00b2'}</Text>
      </View>

      <View style={styles.controlGrid}>
        <Stepper label={'\u041d\u0430\u0447\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c'} value={v0} step={0.5} min={0} max={10} unit={'\u043c/\u0441'} onChange={setV0} />
        <Stepper label={'\u0423\u0441\u043a\u043e\u0440\u0435\u043d\u0438\u0435'} value={accel} step={0.2} min={-3} max={3} unit={'\u043c/\u0441\u00b2'} onChange={setAccel} />
        <Stepper label={'\u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u0432\u0440\u0435\u043c\u0435\u043d\u0438'} value={timeScale} step={0.1} min={0.5} max={2} unit={'x'} onChange={setTimeScale} />
      </View>
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
  track: {
    height: 70,
    justifyContent: 'center',
  },
  trackLine: {
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  car: {
    position: 'absolute',
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    borderRadius: 8,
    backgroundColor: 'rgba(108,99,255,0.85)',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  valueLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  controlGrid: {
    gap: 10,
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
