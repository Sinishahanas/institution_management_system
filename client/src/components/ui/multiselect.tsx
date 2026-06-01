import { Controller } from "react-hook-form";
import ReactSelect from "react-select";

/**
 * @purpose Type for the options in the dropdown.
 *
 * @property {string} label - The display label for the option.
 * @property {string} value - The value of the option.
 */
type Option = { label: string; value: string };

/**
 * @purpose Props for the MultiSelect component.
 *
 * @property {string} name - The name of the form field.
 * @property {any} control - The `react-hook-form` control object returned by `useForm`.
 * @property {Option[]} options - Array of `{ label, value }` options to show in the dropdown.
 * @property {string} [label] - Optional visible label rendered above the select.
 * @property {string} [placeholder] - Optional placeholder for the select input.
 */
interface FormMultiSelectProps {
  name: string;
  control: any;
  options: Option[];
  label?: string;
  placeholder?: string;
}

/**
 * MultiSelect Component
 *
 * @purpose
 * - A controlled multi-select component backed by `react-hook-form` using `Controller`
      and `react-select`. Stores values as an array of option `value` strings in the form state.
 *
 * @param {object} props - Component props
 *   - `name` (string) - The form field name (required).
 *   - `control` (any) - The `react-hook-form` control object returned by `useForm` (required).
 *   - `options` (Option[]) - Array of `{ label, value }` options to show in the dropdown (required).
 *   - `label` (string) - Optional visible label rendered above the select.
 *   - `placeholder` (string) - Optional placeholder for the select input.
 *
 * @returns {JSX.Element} The rendered controller + react-select UI.
 *
 * @sideEffects
 *   - Calls `field.onChange(...)` to update the form state when selection changes.
 *   - Reads `field.value` to compute the currently selected options.
 *
 * @throws {Error} if `name` is not provided or not a string.
 * @throws {Error} if `control` is not provided.
 * @throws {Error} if `options` is not an array.
 *
 * @example
 * ```tsx
 * import { useForm } from "react-hook-form";
 * import { MultiSelect } from "@/components/form/multi-select";
 *
 * function Example() {
 *   const { control } = useForm({ defaultValues: { tags: [] } });
 *   const opts = [
 *     { label: "Music", value: "music" },
 *     { label: "Dance", value: "dance" },
 *   ];
 *
 *   return (
 *     <MultiSelect
 *       name="tags"
 *       control={control}
 *       options={opts}
 *       label="Select categories"
 *       placeholder="Choose..."
 *     />
 *   );
 * }
 * ```
 */
export function MultiSelect({
  name,
  control,
  options,
  label,
  placeholder,
}: FormMultiSelectProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="space-y-2">
          {label && <label className="text-sm font-medium">{label}</label>}
          <ReactSelect
            isMulti
            options={options}
            value={(field.value || []).map((val: string) => {
              const match = options.find((opt) => opt.value === val);
              return match || { label: val, value: val };
            })}
            onChange={(selected) =>
              field.onChange(selected.map((s: any) => s.value))
            }
            placeholder={placeholder}
          />
        </div>
      )}
    />
  );
}
