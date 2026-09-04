export interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleSwitch({ id, checked, onChange }: ToggleSwitchProps) {
  return (
    <label htmlFor={id} className="relative ml-4 inline-flex shrink-0 cursor-pointer items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <div className="peer relative h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-level-1 after:transition-all peer-checked:bg-secondary peer-checked:after:translate-x-full peer-focus-visible:outline-2 peer-focus-visible:outline-primary-focus" />
    </label>
  );
}
