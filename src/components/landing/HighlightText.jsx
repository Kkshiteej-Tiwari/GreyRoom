import clsx from 'clsx';

export default function HighlightText({ children, className }) {
  return (
    <span className={clsx('highlight-text', className)}>
      {children}
    </span>
  );
}
