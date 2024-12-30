import { createContext, useContext, useState } from "react";
import { ItemGroupItf, PackedBoxItf } from "../interfaces";

interface PackedBoxContextItf {
  packedBox: PackedBoxItf;
  step: number;
  setStep: (v: number) => void;
  totalSteps: number;
  currentItemGroups: ItemGroupItf[];
}

const PackedBoxContext = createContext<PackedBoxContextItf | undefined>(
  undefined
);

interface PackedBoxProviderProps {
  packedBox: PackedBoxItf;
  children: React.ReactNode;
}

const PackedBoxProvider = ({ packedBox, children }: PackedBoxProviderProps) => {
  const [step, setStepActual] = useState(0);

  const totalSteps = packedBox.packedItems.length + 1;
  const setStep = (value: number) => {
    if (value < 0 || value > totalSteps) return;
    setStepActual(value);
  };

  const stepPackedItems = packedBox.packedItems.slice(0, step || undefined);
  const itemGroupRecords = stepPackedItems.reduce<Record<string, ItemGroupItf>>(
    (records, pi) => {
      pi.itemGroups.forEach((ig) => {
        if (ig.item.name in records) {
          records[ig.item.name].quantity += ig.quantity;
        } else {
          records[ig.item.name] = { ...ig };
        }
      });
      return records;
    },
    {}
  );
  const currentItemGroups = Object.values(itemGroupRecords);

  return (
    <PackedBoxContext.Provider
      value={{
        packedBox,
        step,
        totalSteps,
        setStep,
        currentItemGroups,
      }}
    >
      {children}
    </PackedBoxContext.Provider>
  );
};

const usePackedBox = () => {
  const context = useContext(PackedBoxContext);
  if (context === undefined) {
    throw new Error("usePackedBox must be used within a PackedBoxProvider");
  }
  return context;
};

export { usePackedBox, PackedBoxProvider };
