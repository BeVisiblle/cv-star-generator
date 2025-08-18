import { useEffect, useRef, useState } from "react";
import { useSearchCompaniesForClaim, CompanyOption } from "@/hooks/useSearchCompanies";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onPick: (company: CompanyOption | null) => void;
  placeholder?: string;
  defaultLabel?: string;
  label?: string;
  value?: CompanyOption | null;
  onTextChange?: (text: string) => void;
  currentText?: string;
};

export function CompanyAutocomplete({ 
  onPick, 
  placeholder = "Unternehmen suchen …", 
  defaultLabel = "", 
  label = "Verifizierter Arbeitgeber (optional)",
  value,
  onTextChange,
  currentText
}: Props) {
  const [input, setInput] = useState(currentText || value?.name || defaultLabel);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const { data: options = [], isFetching } = useSearchCompaniesForClaim(input);

  useEffect(() => {
    if (currentText !== undefined) {
      setInput(currentText);
    } else if (value) {
      setInput(value.name);
    }
  }, [value, currentText]);

  useEffect(() => {
    if (open && options.length) setActiveIndex(0);
  }, [open, options.length]);

  function select(opt: CompanyOption) {
    onPick(opt);
    setInput(opt.name);
    setOpen(false);
  }

  function clear() {
    onPick(null);
    setInput("");
    setOpen(false);
  }

  function handleInputChange(newValue: string) {
    setInput(newValue);
    setOpen(newValue.length >= 2); // Only open if we have enough chars to search
    
    // Call external text change handler if provided
    if (onTextChange) {
      onTextChange(newValue);
    }
    
    // Clear picked company if text doesn't match and we have a text change handler
    if (newValue === "" && value) {
      onPick(null);
    }
  }

  return (
    <div className="relative space-y-1">
      <Label className="text-sm text-foreground/70">{label}</Label>
      <div className="relative">
         <Input
           type="text"
           value={input}
           onChange={(e) => handleInputChange(e.target.value)}
           onFocus={() => input.length >= 2 && setOpen(true)}
           onBlur={() => setTimeout(() => setOpen(false), 150)} // allow click
           placeholder={placeholder}
           aria-autocomplete="list"
           aria-expanded={open}
           className="pr-8"
         />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>

      {open && (isFetching || options.length > 0) && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-input bg-popover shadow-md"
        >
          {isFetching && (
            <li className="px-3 py-2 text-sm text-muted-foreground">Suche …</li>
          )}

          {!isFetching && options.map((opt, i) => (
            <li
              key={opt.id}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(opt)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-accent ${
                i === activeIndex ? "bg-accent" : ""
              }`}
            >
              {opt.logo_url ? (
                <img 
                  src={opt.logo_url} 
                  alt="" 
                  className="h-6 w-6 rounded object-cover" 
                />
              ) : (
                <div className="h-6 w-6 rounded bg-muted flex items-center justify-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    {opt.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="truncate">{opt.name}</span>
            </li>
          ))}

          {!isFetching && options.length === 0 && input.length >= 2 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Kein verifiziertes Unternehmen gefunden. Du kannst oben{" "}
              <span className="font-medium">freien Arbeitgeber</span> eintragen – 
              er erscheint ohne Logo/Link.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}