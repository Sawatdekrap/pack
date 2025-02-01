import { createContext, useContext, useState } from "react";
import { ItemGroupItf, PackedBoxItf, PackedItemsItf } from "../../interfaces";

interface PackedBoxContextItf {
  packedBox: PackedBoxItf;
  step: number;
  setStep: (v: number) => void;
  totalSteps: number;
  currentItemGroups: ItemGroupItf[];
  stepItemGroups: ItemGroupItf[];
  fullscreen: boolean;
  setFullscreen: (val: boolean) => void;
  activatePreview: () => void;
  previewActive: boolean;
}

const PackedBoxContext = createContext<PackedBoxContextItf | undefined>(
  undefined
);

interface PackedBoxProviderProps {
  packedBox: PackedBoxItf;
  activatePreview: () => void;
  previewActive: boolean;
  children: React.ReactNode;
}

const reducePackedItemstoGroups = (
  packedItems: PackedItemsItf[]
): Record<string, ItemGroupItf> => {
  return packedItems.reduce<Record<string, ItemGroupItf>>((records, pi) => {
    pi.itemGroups.forEach((ig) => {
      if (ig.item.name in records) {
        records[ig.item.name].quantity += ig.quantity;
      } else {
        records[ig.item.name] = { ...ig };
      }
    });
    return records;
  }, {});
};

const PackedBoxProvider = ({
  packedBox,
  activatePreview,
  previewActive,
  children,
}: PackedBoxProviderProps) => {
  const totalSteps = packedBox.packedItems.length + 1;
  const [step, setStepActual] = useState(totalSteps);
  const [fullscreen, setFullscreen] = useState(false);

  const setStep = (value: number) => {
    if (value < 0 || value > totalSteps) return;
    setStepActual(value);
  };

  const currentPackedItems = packedBox.packedItems.slice(0, step || undefined);
  const currentGroupRecords = reducePackedItemstoGroups(currentPackedItems);
  const currentItemGroups = Object.values(currentGroupRecords);
  const stepPackedItems =
    step === 0 || step === totalSteps
      ? []
      : packedBox.packedItems.slice(step - 1, step);
  const stepGroupRecords = reducePackedItemstoGroups(stepPackedItems);
  const stepItemGroups = Object.values(stepGroupRecords);

  return (
    <PackedBoxContext.Provider
      value={{
        packedBox,
        step,
        totalSteps,
        setStep,
        currentItemGroups,
        stepItemGroups,
        fullscreen,
        setFullscreen,
        activatePreview,
        previewActive,
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
