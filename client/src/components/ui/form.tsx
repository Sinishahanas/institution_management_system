import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

/**
 * @purpose
 * - Provides a context-based wrapper around form elements using React Hook Form's `FormProvider`.
 * - Enables child components to access form context without prop drilling.
 *
 * @type {import("react-hook-form").FormProvider}
 * @param {import("react-hook-form").FormProviderProps} props - Props passed to react-hook-form FormProvider
 * @returns {JSX.Element} A context provider that supplies form state and methods to its children.
 * @throws {Error} Does not directly throw errors; runtime issues would originate from `FormProvider` or children and be handled by React's error boundaries.
 * @sideEffects None.
 *
 * @example
 * <Form {...formMethods}>
 *   <FormField name="email" control={control}>
 *     <FormItem>
 *       <FormLabel>Email</FormLabel>
 *       <FormControl asChild>
 *         <Input />
 *       </FormControl>
 *       <FormDescription>Enter your email address</FormDescription>
 *       <FormMessage />
 *     </FormItem>
 *   </FormField>
 * </Form>
 */
const Form = FormProvider

/**
 * @purpose
 * - Context to store the name of a field for FormLabel, FormControl, and FormMessage.
 * 
 * @type {object}
 * @template {FieldValues} TFieldValues - The type of the form values.
 * @template {FieldPath<TFieldValues>} TName - The type of the field name.
 * @property {TName} name - The name of the field.
 * 
 * @param {FormFieldContextValue<TFieldValues, TName>} props - Props passed to react-hook-form FormFieldContext
 * @returns {FormFieldContextValue<TFieldValues, TName>} The context value.
 * @throws {Error} If used outside a <FormField>
 * @sideEffects None.
 * 
 * @example
 * const name = React.useContext(FormFieldContext);
 */
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  /** The name of the field */
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

/**
 * @purpose
 * - Wraps a Controller from react-hook-form.
 * - Provides context for nested form components.
 * 
 * @param {ControllerProps} props - Props passed to react-hook-form Controller
 * @returns {JSX.Element} Rendered Controller wrapped in FormFieldContext
 * @throws {Error} If used outside of a `FormField` component, as it relies on `useFormField`.
 * @sideEffects Provides React context for nested Form components.
 * 
 * @example
 * <FormField name="username" control={control}>
 *   <FormItem>
 *     <FormLabel>Username</FormLabel>
 *     <FormControl asChild>
 *       <Input />
 *     </FormControl>
 *     <FormDescription>Enter your username</FormDescription>
 *     <FormMessage />
 *   </FormItem>
 * </FormField>
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

/**
 * @purpose
 * - Hook to access field state and metadata from FormField.
 * - Returns id, name, and state info for error handling, aria attributes, etc.
 *
 * @returns {object} Object containing field id, name, error, and ARIA attributes
 * @throws {Error} If used outside a <FormField>
 * @sideEffects None, reads context and form state
 * 
 * @example
 * const { id, name, error } = useFormField();
 */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

/**
 * @purpose
 * - Context to store the id of a FormItem
 * 
 * @type {object}
 * @property {string} id - Unique id for the form item
 * 
 * @param {object} props - Props passed to react-hook-form FormItemContext
 * @returns {FormItemContextValue} The context value.
 * @throws {Error} If used outside a <FormField>
 * @sideEffects None.
 * 
 * @example
 * const id = React.useContext(FormItemContext);
 */
type FormItemContextValue = {
   /** Unique id for the form item */
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

/**
 * @purpose
 * - Wrapper for individual form fields.
 * - Adds spacing and provides context for labels, controls, and messages.
 * 
 * @param {object} props - HTML div attributes
 * @returns {JSX.Element} Rendered form item container
 * @sideEffects Provides context for nested form components.
 * @throws {Error} If used outside of a `FormField` component, as it relies on `useFormField`.
 * 
 * @example
 * <FormItem>
 *   <FormLabel>Name</FormLabel>
 *   <FormControl asChild><Input /></FormControl>
 * </FormItem>
 */
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

/**
 * @purpose
 * - Label for a form field. Highlights red if the field has an error.
 * 
 * @param {FormLabelProps} props - Label props
 * @returns {JSX.Element} Rendered label
 * @throws {Error} If used outside of a `FormField` component, as it relies on `useFormField`.
 * @sideEffects Reads `formItemId` from `useFormField` to set its `htmlFor` attribute.
 * 
 * @example
 * <FormLabel>Email</FormLabel>
 */
const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

/**
 * @purpose - Form control wrapper (e.g., input, select) that handles ARIA attributes and error state.
 *
 * @param {FormControlProps} props - Slot props or native input props
 * @returns {JSX.Element} Rendered form control
 * @throws {Error} If used outside of a `FormField` component, as it relies on `useFormField`.
 * @sideEffects Reads form field state via useFormField
 * 
 * @example
 * <FormControl asChild>
 *   <Input />
 * </FormControl>
 */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

/**
 * @purpose - 
 * - Displays a descriptive text associated with a form field.
 * - Typically used to provide instructions to the user.
 * 
 * @param {FormDescriptionProps} props - The properties to pass to the underlying `p` element, including `className` and children.
 * @param {React.Ref<HTMLParagraphElement>} ref - A ref to the underlying paragraph element.
 * @returns {JSX.Element} A React element representing the descriptive text for a form field.
 * @throws {Error} If used outside of a `FormField` component, as it relies on `useFormField`.
 * @sideEffects Reads `formDescriptionId` from `useFormField` to set its `id` attribute.
 * 
 * @example
 * <FormItem>
 *   <FormLabel>Email</FormLabel>
 *   <FormControl><Input type="email" /></FormControl>
 *   <FormDescription>Your email will only be used for account recovery.</FormDescription>
 * </FormItem>
 */
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

/**
 * @purpose
 * - Displays validation error messages for a form field
 * - Automatically shows the validation error from react-hook-form.
 *
 * @param {FormMessageProps} props - The properties to pass to the underlying `p` element, including `className` and children.
 * @param {React.Ref<HTMLParagraphElement>} ref - A ref to the underlying paragraph element.
 * @returns {JSX.Element | null} A React element representing the error message, or `null` if no error or children are present.
 * @throws {Error} If used outside of a `FormField` component, as it relies on `useFormField`.
 * 
 * @sideEffects Reads error state and `formMessageId` from `useFormField` to display the message and set its `id`.
 *
 * @example
 * <FormItem>
 *   <FormLabel>Password</FormLabel>
 *   <FormControl><Input type="password" /></FormControl>
 *   <FormMessage />
 * </FormItem>
 */
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
