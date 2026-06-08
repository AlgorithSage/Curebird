import * as React from "react";

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

const GlassButton = React.forwardRef(
  ({ className, children, size = "default", contentClassName, ...props }, ref) => {
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
          "glass-button-wrap",
          className
        )}
        style={{ borderRadius: "9999px" }}
      >
        <button
          className="glass-button"
          ref={ref}
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
        <div className="glass-button-shadow" style={{ borderRadius: "9999px" }}></div>
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton };
