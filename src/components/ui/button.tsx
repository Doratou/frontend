import type { ComponentProps, ReactNode } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'dorato-button relative inline-flex shrink-0 items-center justify-center border-0 whitespace-nowrap outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid disabled:pointer-events-none disabled:cursor-not-allowed data-disabled:pointer-events-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'disabled:bg-neutral-30 disabled:text-neutral-60 data-disabled:bg-neutral-30 data-disabled:text-neutral-60',
        outline:
          'border-[length:var(--button-border-width)] bg-transparent disabled:border-neutral-30 disabled:bg-neutral-10 disabled:text-neutral-50 data-disabled:border-neutral-30 data-disabled:bg-neutral-10 data-disabled:text-neutral-50',
        ghost:
          'bg-transparent hover:bg-foreground/5 active:bg-foreground/10 disabled:opacity-50 data-disabled:opacity-50',
        link: 'bg-transparent text-primary no-underline hover:text-primary-70 focus-visible:text-primary-70 active:text-primary-80 disabled:opacity-50 data-disabled:opacity-50 dark:hover:text-primary-20 dark:focus-visible:text-primary-20 dark:active:text-primary-10',
      },
      tone: { primary: '', secondary: '', accent: '' },
      size: {
        md: 'h-8.75 gap-2.5 px-2.5 text-button-md',
        lg: 'h-10.5 gap-3 px-3 text-button-lg',
        xl: 'h-14 gap-3 px-5 text-button-xl',
        'icon-md': 'h-8.75 w-11 p-0',
        'icon-lg': 'h-10.5 w-12 p-0',
        'icon-xl': 'size-14 p-0',
        default: 'h-8.75 gap-2.5 px-2.5 text-button-md',
        icon: 'size-11 p-0',
      },
      radius: {
        sm: 'rounded-(--button-radius-sm)',
        md: 'rounded-(--button-radius-md)',
        lg: 'rounded-(--button-radius-lg)',
        full: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        tone: 'primary',
        className:
          'bg-primary-70 text-neutral-10 hover:bg-primary-80 active:bg-primary-80 dark:bg-primary-30 dark:text-primary-80 dark:hover:bg-primary-20 dark:active:bg-primary-40',
      },
      {
        variant: 'default',
        tone: 'secondary',
        className:
          'bg-secondary-60 text-white hover:bg-secondary-70 active:bg-secondary-80 dark:bg-secondary-50 dark:hover:bg-secondary-40 dark:active:bg-secondary-30',
      },
      {
        variant: 'default',
        tone: 'accent',
        className:
          'bg-accent-40 text-white hover:bg-accent-50 active:bg-accent-70 dark:active:bg-accent-50',
      },
      {
        variant: 'outline',
        tone: 'primary',
        className:
          'border-primary-70 text-primary-70 hover:bg-primary-10 active:bg-primary-20 dark:border-primary-30 dark:text-primary-30 dark:hover:bg-primary-80 dark:active:bg-primary-70',
      },
      {
        variant: 'outline',
        tone: 'secondary',
        className:
          'border-secondary-70 text-secondary-60 hover:bg-secondary-10 active:bg-secondary-20 dark:border-secondary-30 dark:text-secondary-30 dark:hover:bg-secondary-80 dark:active:bg-secondary-80',
      },
      {
        variant: 'outline',
        tone: 'accent',
        className:
          'border-accent-50 text-accent-50 hover:bg-accent-10 active:bg-accent-20 dark:border-accent-30 dark:text-accent-30 dark:hover:bg-accent-80 dark:active:bg-accent-80',
      },
    ],
    defaultVariants: {
      variant: 'default',
      tone: 'primary',
      size: 'md',
      radius: 'sm',
    },
  },
);

function ButtonBase({
  className,
  variant,
  tone,
  size = 'md',
  radius,
  startIcon,
  endIcon,
  children,
  disabled,
  onClickCapture,
  asChild = false,
  type,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  }) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      {...props}
      data-slot="button"
      data-size={size}
      data-variant={variant ?? 'default'}
      data-disabled={disabled ? '' : undefined}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      tabIndex={asChild && disabled ? -1 : props.tabIndex}
      type={asChild ? undefined : (type ?? 'button')}
      onClickCapture={(event) => {
        if (asChild && disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClickCapture?.(event);
      }}
      className={cn(buttonVariants({ variant, tone, size, radius, className }))}
    >
      {startIcon && (
        <span aria-hidden="true" className="inline-flex">
          {startIcon}
        </span>
      )}
      <Slottable>{children}</Slottable>
      {endIcon && (
        <span aria-hidden="true" className="inline-flex">
          {endIcon}
        </span>
      )}
    </Component>
  );
}

const MotionButton = motion.create(ButtonBase);

export function Button({
  variant,
  disabled,
  hoverScale = variant === 'ghost' || variant === 'link' ? 1 : 1.02,
  pressScale = 0.97,
  whileHover,
  whileTap,
  transition,
  initial = false,
  ...props
}: ComponentProps<typeof MotionButton> & {
  hoverScale?: number;
  pressScale?: number;
}) {
  const reducedMotion = useReducedMotion();
  const interactive = !disabled && !reducedMotion;

  return (
    <MotionButton
      {...props}
      variant={variant}
      disabled={disabled}
      initial={initial}
      whileHover={
        interactive ? (whileHover ?? { scale: hoverScale }) : undefined
      }
      whileTap={interactive ? (whileTap ?? { scale: pressScale }) : undefined}
      transition={transition ?? { type: 'spring', stiffness: 450, damping: 30 }}
    />
  );
}
