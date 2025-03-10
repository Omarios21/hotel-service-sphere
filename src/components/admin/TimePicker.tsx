
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({ 
  id, 
  value, 
  onChange,
  disabled = false
}) => {
  const [timeValue, setTimeValue] = useState(value);
  
  // Sync with parent value when it changes externally
  useEffect(() => {
    setTimeValue(value);
  }, [value]);
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTimeValue(newValue);
    onChange(newValue);
  };
  
  return (
    <Input
      id={id}
      type="time"
      value={timeValue}
      onChange={handleTimeChange}
      disabled={disabled}
    />
  );
};
