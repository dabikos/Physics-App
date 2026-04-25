import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
  disabled?: boolean;
  status?: 'default' | 'correct' | 'incorrect';
}

export function NumberInput({
  value,
  onChange,
  unit,
  placeholder = "Введите ответ",
  disabled = false,
  status = 'default',
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const getStatusStyles = () => {
    switch (status) {
      case 'correct':
        return {
          borderColor: '#10B981',
          backgroundColor: '#D1FAE5',
          iconColor: '#10B981',
          icon: 'checkmark-circle' as const,
        };
      case 'incorrect':
        return {
          borderColor: '#EF4444',
          backgroundColor: '#FEE2E2',
          iconColor: '#EF4444',
          icon: 'close-circle' as const,
        };
      default:
        return {
          borderColor: isFocused ? '#6C63FF' : '#E5E7EB',
          backgroundColor: '#FFFFFF',
          iconColor: '#6B7280',
          icon: null,
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: statusStyles.borderColor,
            backgroundColor: statusStyles.backgroundColor,
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {unit && (
          <View style={styles.unitContainer}>
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        )}
        {statusStyles.icon && (
          <View style={styles.statusIcon}>
            <Ionicons
              name={statusStyles.icon}
              size={24}
              color={statusStyles.iconColor}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    height: '100%',
  },
  unitContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusIcon: {
    marginLeft: 8,
  },
});

















