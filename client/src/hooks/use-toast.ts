import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

/** Maximum number of concurrent toasts to display */
const TOAST_LIMIT = 1

/** Delay in ms before automatically removing a dismissed toast */
const TOAST_REMOVE_DELAY = 1000000

/**
 * Internal type representing a toast with all properties, including an ID.
 */
type ToasterToast = ToastProps & {

  /** Unique identifier for the toast */
  id: string

  /** Toast title (optional) */
  title?: React.ReactNode

  /** Toast description (optional) */
  description?: React.ReactNode

  /** Optional action element for the toast */
  action?: ToastActionElement
}

/** Action types for toast reducer */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

/**
 * @purpose
 * - Generates a unique string ID by incrementing a global counter.
 * - The counter wraps around using modulo `Number.MAX_SAFE_INTEGER`.
 * 
 * @param None
 * @returns {string} A string representation of the next unique ID.
 * @throws {ReferenceError} Throws if `count` is not defined in the outer scope.
 * @sideEffects Modifies the global variable `count`.
 *
 * @example
 * // Assuming count is initialized as 0
 * let id1 = genId(); // "1"
 * let id2 = genId(); // "2"
 *
 * @example
 * // Counter wraps around at Number.MAX_SAFE_INTEGER
 * count = Number.MAX_SAFE_INTEGER - 1;
 * let id = genId(); // "0"
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

/** Actions handled by the toast reducer */
type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

/** State type for the toast system */
interface State {
  /** Array of active toasts */
  toasts: ToasterToast[]
}

/** Map to track timeout handles for automatically removing dismissed toasts */
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()


/**
 * @purpose
 * - Adds a toast ID to the removal queue if it is not already scheduled for removal.
 * - Sets a timeout to automatically remove the toast after a delay.
 *
 * @param {string} toastId - The unique ID of the toast to schedule for removal.
 * @returns {void} This function does not return a value.
 * @throws {TypeError} Throws if `toastId` is not a string.
 * @sideEffects
 * - Schedules a timeout to remove a toast.
 * - Modifies the `toastTimeouts` map by adding or deleting entries.
 * - Dispatches a "REMOVE_TOAST" action via `dispatch`.
 * 
 * @example
 * addToRemoveQueue("toast123");
 * // After TOAST_REMOVE_DELAY milliseconds, the toast with ID "toast123" is removed.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}


/**
 * @purpose
 * - Reducer function for managing toast notifications.
 * - Handles adding, updating, dismissing, and removing toasts from the state.
 *
 * @param {State} state - The current state containing the list of toasts.
 * @param {Action} action - The action to perform on the state.
 * @returns {State} The updated state after applying the action.
 * @throws {TypeError} Throws if `action` does not match expected shape.
 * @sideEffects
 * - `DISMISS_TOAST` action triggers `addToRemoveQueue`, which schedules toast removal.
 *
 * @example
 * const initialState: State = { toasts: [] };
 * 
 * // Add a new toast
 * const state1 = reducer(initialState, { type: "ADD_TOAST", toast: { id: "1", message: "Hello", open: true } });
 * 
 * // Update the toast
 * const state2 = reducer(state1, { type: "UPDATE_TOAST", toast: { id: "1", message: "Updated!" } });
 * 
 * // Dismiss the toast
 * const state3 = reducer(state2, { type: "DISMISS_TOAST", toastId: "1" });
 * 
 * // Remove the toast
 * const state4 = reducer(state3, { type: "REMOVE_TOAST", toastId: "1" });
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}


/**
 * Array of listener callbacks that are invoked when the state changes.
 * @type {Array<(state: State) => void>}
 */
const listeners: Array<(state: State) => void> = []

/**
 * In-memory state to store the current list of toasts.
 * @type {State}
 */
let memoryState: State = { toasts: [] }


/**
 * @purpose
 * - Dispatches an action to update the toast state.
 * - This function applies the action to the current `memoryState` using the `reducer`, then notifies all registered listeners of the updated state.
 *
 * @param {Action} action - The action to dispatch to the reducer.
 * @returns {void} This function does not return a value.
 * @throws {Error} Throws if `action` is not a valid Action object.
 * @sideEffects
 * - Updates the global `memoryState`.
 * - Calls all functions in the `listeners` array with the updated state.
 *
 * @example
 * dispatch({ type: "ADD_TOAST", toast: { message: "Hello", open: true } });
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}


/**
 * Type representing a toast object without an `id`.
 * 
 * This is useful for creating new toasts before assigning a unique `id`.
 *
 * @typedef {Omit<ToasterToast, "id">} Toast
 *
 * @example
 * const newToast: Toast = { message: "New notification", open: true };
 */
type Toast = Omit<ToasterToast, "id">


/**
 * @purpose
 * - Creates and displays a new toast notification.
 * - This function generates a unique ID for the toast, dispatches an "ADD_TOAST" action to add it to the state, and returns helper methods to update or dismiss the toast.
 *
 * @param {Toast} props - The properties of the toast (excluding `id`).
 * @returns {Object} An object containing the `id` of the toast and helper functions:
 *   - `dismiss`: Function to dismiss the toast manually.
 *   - `update`: Function to update the toast properties dynamically.
 * @throws {Error} Throws if `props` is not a valid Toast object.
 * @sideEffects
 * - Adds a new toast to the global toast state.
 * - Registers an `onOpenChange` callback that dismisses the toast when it is closed.
 *
 * @example
 * const myToast = toast({ message: "Hello, World!", duration: 3000 });
 * 
 * // Update the toast message
 * myToast.update({ message: "Updated message!" });
 * 
 * // Dismiss the toast manually
 * myToast.dismiss();
 */
function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}


/**
 * @purpose React hook to access the toast state and control functions.
 *
 * @param {State} state - The current state containing the list of toasts.
 * @returns {Object} Current toasts and helper functions: toast(), dismiss()
 * @throws {Error} Throws if `state` is not a valid State object.
 * @sideEffects Subscribes to memoryState changes and updates React state
 * 
 * @example
 * const { toasts, toast, dismiss } = useToast();
 * toast({ title: "Hello", description: "World" });
 * dismiss(toastId);
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
