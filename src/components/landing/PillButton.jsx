import clsx from "clsx";

export default function PillButton({
  children,
  variant = "primary",
  className,
  icon,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-pill font-semibold text-sm sm:text-[15px] btn-premium transition-all duration-200";

  const variants = {
    primary:
      "bg-cta text-white shadow-cta hover:shadow-elevated active:scale-95",
    ghost:
      "bg-transparent text-text-primary border-2 border-grey-200 hover:border-grey-400 active:scale-95",
    white:
      "bg-white text-text-primary shadow-soft-sm hover:shadow-soft active:scale-95",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {icon && <span className="w-4 h-4 sm:w-5 sm:h-5">{icon}</span>}
      {children}
    </button>
  );
}
