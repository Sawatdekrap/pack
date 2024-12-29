import { createContext, useContext, useState } from "react";
import { ItemGroupItf, PackedBoxItf } from "../interfaces";

interface PackedBoxContextItf {
  packedBox: PackedBoxItf;
  step: number;
  setStep: (v: number) => void;
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
  const [step, setStep] = useState(0);

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
