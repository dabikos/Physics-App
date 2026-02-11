import { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type OhmsLawSimulationProps = {
  voltage?: number
  resistance?: number
}

export function OhmsLawSimulation({ voltage: voltageProp, resistance: resistanceProp }: OhmsLawSimulationProps) {
  const [voltage, setVoltage] = useState(voltageProp ?? 6)
  const [resistance, setResistance] = useState(resistanceProp ?? 4)

  const current = useMemo(() => voltage / resistance, [voltage, resistance])
  const power = useMemo(() => voltage * current, [voltage, current])
  const glow = Math.min(1, current / 3)

  useEffect(() => {
    if (voltageProp != null && voltageProp !== voltage) setVoltage(voltageProp)
  }, [voltageProp])

  useEffect(() => {
    if (resistanceProp != null && resistanceProp !== resistance) setResistance(resistanceProp)
  }, [resistanceProp])

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{'\u0417\u0430\u043a\u043e\u043d \u041e\u043c\u0430'}</Text>

      <View style={styles.circuit}>
        <View style={[styles.bulb, { backgroundColor: `rgba(255, 214, 102, ${0.25 + glow * 0.6})` }]} />
        <View style={styles.wire} />
        <View style={[styles.source, { borderColor: `rgba(255, 214, 102, ${0.4 + glow * 0.4})` }]} />
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.valueLabel}>{`U = ${voltage.toFixed(1)} \u0412`}</Text>
        <Text style={styles.valueLabel}>{`R = ${resistance.toFixed(1)} \u03a9`}</Text>
        <Text style={styles.valueLabel}>{`I = ${current.toFixed(2)} \u0410`}</Text>
        <Text style={styles.valueLabel}>{`P = ${power.toFixed(1)} \u0412\u0442`}</Text>
      </View>

      <Stepper label={'\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435'} value={voltage} step={0.5} min={1} max={12} unit={'\u0412'} onChange={setVoltage} />
      <Stepper label={'\u0421\u043e\u043f\u0440\u043e\u0442\u0438\u0432\u043b\u0435\u043d\u0438\u0435'} value={resistance} step={0.5} min={1} max={20} unit={'\u03a9'} onChange={setResistance} />
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
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  circuit: {
    height: 80,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bulb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#ffd666',
  },
  wire: {
    width: 120,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,214,102,0.5)',
  },
  source: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'rgba(255,214,102,0.2)',
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
