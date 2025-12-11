import * as React from "react"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, children, ...props }, ref) => {
  const handleChange = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      role="radiogroup"
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            checked: (child as any).props.value === value,
            onCheckedChange: () => handleChange((child as any).props.value),
          });
        }
        return child;
      })}
    </div>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    value: string;
    checked?: boolean;
    onCheckedChange?: () => void;
  }
>(({ className, value, checked, onCheckedChange, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="radio"
      value={value}
      checked={checked}
      onChange={onCheckedChange}
      className={cn(
        "h-4 w-4 border border-primary text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

