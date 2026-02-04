import { motion } from "framer-motion";
import clsx from "clsx";

export default function GlassCard({
  children,
  className,
  animate = true,
  ...props
}) {
  const Component = animate ? motion.div : "div";

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6, ease: [0.2, 1, 0.3, 1] },
      }
    : {};

  return (
    <Component
      className={clsx(
        "glass rounded-2xl sm:rounded-card p-4 sm:p-6",
        className,
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
}
