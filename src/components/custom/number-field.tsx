import type { ComponentProps } from 'react';
import { Field } from '@base-ui/react/field';
import { NumberField as NumberPrimitive } from '@base-ui/react/number-field';
import { Minus, Plus } from 'lucide-react';
import { FormField } from '@/components/custom/form-field';
import { FieldOutline } from '@/components/custom/field-outline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const stepperControls = [
  { Control: NumberPrimitive.Decrement, Icon: Minus, action: 'کاهش' },
  { Control: NumberPrimitive.Increment, Icon: Plus, action: 'افزایش' },
];

export type NumberFieldProps = Omit<
  ComponentProps<typeof NumberPrimitive.Root>,
  'className'
> & {
  label: string;
  description?: string;
  error?: string;
  fieldSize?: 'md' | 'lg';
  className?: string;
};

export function NumberField({
  label,
  description,
  error,
  fieldSize = 'lg',
  className,
  disabled,
  ...props
}: NumberFieldProps) {
  return (
    <FormField
      className={cn(
        'dorato-text-field dorato-number-field max-sm:[--field-font-size:1rem] max-sm:[--field-height:3rem] pointer-coarse:[--field-font-size:1rem] pointer-coarse:[--field-height:3rem]',
        className,
      )}
      data-size={fieldSize}
      data-status={error ? 'error' : 'default'}
      description={description}
      error={error}
      disabled={disabled}
    >
      <NumberPrimitive.Root
        {...props}
        disabled={disabled}
        locale="fa-IR"
        className="dorato-floating-field relative flex min-w-0 items-center gap-2 px-3"
        data-surface="solid"
        data-float=""
      >
        <NumberPrimitive.Input
          className="dorato-floating-control w-full min-w-0 flex-1 border-0 bg-transparent text-foreground outline-none [font:inherit]"
          aria-roledescription="ورودی عددی"
        />
        <div
          dir="ltr"
          className="dorato-number-stepper flex shrink-0 items-center overflow-hidden rounded-lg border border-primary-20 bg-primary-10 text-primary-60"
        >
          {stepperControls.map(({ Control, Icon, action }) => (
            <Control
              key={action}
              aria-label={`${action} ${label}`}
              render={
                <Button
                  size="icon-md"
                  variant="ghost"
                  radius="md"
                  hoverScale={1}
                  pressScale={1}
                  className="size-7.5 rounded-none p-0 text-primary-60 transition-colors duration-120 ease-out last:border-s last:border-primary-20 hover:bg-primary-20 hover:text-primary-80 active:bg-primary-30 max-sm:size-11 pointer-coarse:size-11 [&_svg]:size-3.75"
                />
              }
            >
              <Icon aria-hidden="true" />
            </Control>
          ))}
        </div>
        <FieldOutline label={label} />
        <Field.Label className="dorato-floating-label absolute cursor-text truncate">
          {label}
        </Field.Label>
      </NumberPrimitive.Root>
    </FormField>
  );
}
