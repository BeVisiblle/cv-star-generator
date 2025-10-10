import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DateWheelPickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
  onConfirm?: () => void;
  minAge?: number; // Mindestalter in Jahren
  maxAge?: number; // Maximalalter in Jahren
}

export const DateWheelPicker: React.FC<DateWheelPickerProps> = ({
  value,
  onChange,
  onConfirm,
  minAge = 16,
  maxAge = 100
}) => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - maxAge;
  const maxYear = currentYear - minAge;

  // Parse initial value or set default
  const parseDate = (dateStr?: string) => {
    if (!dateStr) {
      const defaultDate = new Date(2005, 0, 1); // Default: 01.01.2005
      return {
        day: 1,
        month: 1,
        year: 2005
      };
    }
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  };

  const initial = parseDate(value);
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [selectedMonth, setSelectedMonth] = useState(initial.month);
  const [selectedYear, setSelectedYear] = useState(initial.year);

  const dayRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    // Update parent component
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onChange(dateStr);
  }, [selectedDay, selectedMonth, selectedYear, onChange]);

  const scrollToValue = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      const itemHeight = 48; // h-12 = 48px
      ref.current.scrollTop = index * itemHeight - itemHeight * 2; // Center the selected item
    }
  };

  useEffect(() => {
    scrollToValue(dayRef, days.indexOf(selectedDay));
    scrollToValue(monthRef, selectedMonth - 1);
    scrollToValue(yearRef, years.indexOf(selectedYear));
  }, []);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const itemHeight = 48;
    const scrollTop = ref.current.scrollTop;
    const centerOffset = 96; // h-24 padding
    const index = Math.round((scrollTop - centerOffset) / itemHeight);
    
    // Update based on which column
    if (ref === dayRef && days[index]) {
      setSelectedDay(days[index]);
    } else if (ref === monthRef && months[index]) {
      setSelectedMonth(index + 1);
    } else if (ref === yearRef && years[index]) {
      setSelectedYear(years[index]);
    }
  };

  const WheelColumn = ({ 
    items, 
    selectedValue, 
    onSelect, 
    scrollRef,
    renderItem 
  }: { 
    items: any[], 
    selectedValue: any, 
    onSelect: (value: any) => void,
    scrollRef: React.RefObject<HTMLDivElement>,
    renderItem: (item: any) => React.ReactNode
  }) => (
    <div className="relative flex-1 h-[240px] overflow-hidden">
      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />
      
      {/* Selection highlight */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-12 bg-primary/5 border-y border-primary/20 pointer-events-none z-10" />
      
      {/* Scrollable list */}
      <div 
        ref={scrollRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory px-2"
        onScroll={() => handleScroll(scrollRef)}
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Top padding */}
        <div className="h-24 pointer-events-none" />
        
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              onSelect(item);
              scrollToValue(scrollRef, index);
            }}
            className={cn(
              "h-12 flex items-center justify-center cursor-pointer transition-all snap-center select-none",
              selectedValue === item 
                ? "text-foreground font-semibold text-lg scale-110" 
                : "text-muted-foreground text-sm"
            )}
          >
            {renderItem(item)}
          </div>
        ))}
        
        {/* Bottom padding */}
        <div className="h-24 pointer-events-none" />
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold">Geburtsdatum wählen</h3>
        <p className="text-sm text-muted-foreground">
          Wähle dein Geburtsdatum aus
        </p>
      </div>

      <div className="flex gap-2 w-full">
        {/* Day Column */}
        <WheelColumn
          items={days}
          selectedValue={selectedDay}
          onSelect={setSelectedDay}
          scrollRef={dayRef}
          renderItem={(day) => String(day).padStart(2, '0')}
        />

        {/* Month Column */}
        <WheelColumn
          items={months}
          selectedValue={months[selectedMonth - 1]}
          onSelect={(month) => setSelectedMonth(months.indexOf(month) + 1)}
          scrollRef={monthRef}
          renderItem={(month) => month}
        />

        {/* Year Column */}
        <WheelColumn
          items={years}
          selectedValue={selectedYear}
          onSelect={setSelectedYear}
          scrollRef={yearRef}
          renderItem={(year) => year}
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Ausgewähltes Datum: <span className="font-medium text-foreground">
          {String(selectedDay).padStart(2, '0')}.{String(selectedMonth).padStart(2, '0')}.{selectedYear}
        </span></p>
      </div>

      {onConfirm && (
        <Button 
          onClick={onConfirm}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          Bestätigen
        </Button>
      )}
    </div>
  );
};
