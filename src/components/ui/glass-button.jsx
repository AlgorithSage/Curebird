import * as React from "react";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

const GlassButton = React.forwardRef(
  ({ className, children, size = "default", contentClassName, disabled, ...props }, ref) => {
    // Size-specific inline styles for the button
    const sizeStyles = {
      default: {},
      sm: {},
      lg: {},
      icon: { width: "2.5rem", height: "2.5rem" },
    };

    // Size-specific classes for the text/content span
    const textSizeClasses = {
      default: "glass-btn-text-default",
      sm: "glass-btn-text-sm",
      lg: "glass-btn-text-lg",
      icon: "glass-btn-text-icon",
    };

    return (
      <div
        className={cn(
          "glass-button-wrap rounded-full",
          disabled && "disabled",
          className
        )}
      >
        <button
          className="glass-button rounded-full"
          ref={ref}
          disabled={disabled}
          style={sizeStyles[size] || {}}
          {...props}
        >
          <span
            className={cn(
              "glass-button-text",
              textSizeClasses[size] || "",
              contentClassName
            )}
          >
            {children}
          </span>
        </button>
        <div className="glass-button-shadow rounded-full"></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton };
