interface SkeletonBoxProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export default function SkeletonBox({ className = '', width, height, rounded = 'rounded' }: SkeletonBoxProps) {
  const classes = ['bg-[#ECECF0]', 'dark:bg-[#454545]', 'animate-pulse', rounded, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={{
        width: width || '100%',
        height: height || '100%',
      }}
    />
  );
}
