/*
 * Usage:
 *   const { alert, confirm, prompt } = useModals()
 *   alert("Hey!") // awaitable too
 *   if (await confirm("Are you sure?")) ...
 *   const result = await prompt("Enter a URL", "http://")
 */

import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { AcceptSignConfirm } from "../components/Modals/AcceptSign";

// TODO: Select field contents when a prompt() loads
// TODO: Fix Promise<> return types instead of using any

enum ModalType {
  Alert,
  Confirm,
  Prompt,
  AcceptSignConfirm,
}

export interface Modals {
  alert: (message: string) => Promise<any>;
  confirm: (message: string) => Promise<any>;
  prompt: (message: string, defaultValue?: string) => Promise<any>;
  acceptSignConfirm: (message: string) => Promise<any>;
}

const defaultContext: Modals = {
  alert() {
    throw new Error("<ModalProvider> is missing");
  },
  confirm() {
    throw new Error("<ModalProvider> is missing");
  },
  prompt() {
    throw new Error("<ModalProvider> is missing");
  },
  acceptSignConfirm() {
    throw new Error("<ModalProvider> is missing");
  },
};

const Context = createContext<Modals>(defaultContext);

interface AnyEvent {
  preventDefault(): void;
}

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ReactNode | null>(null);
  const input = useRef<HTMLInputElement>(null);
  // const ok = useRef<HTMLButtonElement>(null);

  const createOpener = useCallback(
    (type: ModalType) =>
      (message: string, defaultValue = "") =>
        new Promise((resolve) => {
          console.log(message, defaultValue);
          const handleClose = (e?: AnyEvent) => {
            e?.preventDefault();
            setModal(null);
            resolve(null);
          };

          const handleCancel = (e?: AnyEvent) => {
            e?.preventDefault();
            setModal(null);
            if (type === ModalType.Prompt) resolve(null);
            else resolve(false);
          };

          const handleOK = (e?: AnyEvent) => {
            e?.preventDefault();
            setModal(null);
            if (type === ModalType.Prompt) resolve(input.current?.value);
            else resolve(true);
          };

          let modal = null;
          if (type === ModalType.AcceptSignConfirm) {
            modal = (
              <AcceptSignConfirm
                handleClose={handleClose}
                handleCancel={handleCancel}
                handleOK={handleOK}
              />
            );
          }
          setModal(modal);
        }),
    []
  );

  return (
    <Context.Provider
      value={{
        alert: createOpener(ModalType.Alert),
        confirm: createOpener(ModalType.Confirm),
        prompt: createOpener(ModalType.Prompt),
        acceptSignConfirm: createOpener(ModalType.AcceptSignConfirm),
      }}
    >
      {children}
      {modal}
    </Context.Provider>
  );
};

const useModals = () => useContext(Context);

export default useModals;
