// Inspired by react-hot-toast library
import * as React from "react";
import { type ToastProps } from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
};

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type State = {
  toasts: ToasterToast[];
};

let memoryState: State = { toasts: [] };

const listeners: Array<(state: State) => void> = [];

function dispatch(action: any) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type ActionType = 'ADD_TOAST' | 'DISMISS_TOAST' | 'REMOVE_TOAST';

type Action =
  | {
      type: 'ADD_TOAST';
      toast: ToasterToast;
    }
  | {
      type: 'DISMISS_TOAST';
      toastId?: ToasterToast['id'];
    }
  | {
      type: 'REMOVE_TOAST';
      toastId?: ToasterToast['id'];
    };


const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
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
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const toast = (props: Omit<ToasterToast, "id">) => {
  const id = Math.random().toString(36).substr(2, 9);

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss(id);
      },
    },
  });

  return {
    id: id,
    dismiss: () => dismiss(id),
  };
};

function dismiss(toastId: string) {
  dispatch({ type: "DISMISS_TOAST", toastId });

  setTimeout(() => {
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState);
  
    React.useEffect(() => {
      listeners.push(setState);
      return () => {
        const index = listeners.indexOf(setState);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }, [state]);
  
    return {
      ...state,
      toast,
      dismiss,
    };
  }

export { useToast, toast };
