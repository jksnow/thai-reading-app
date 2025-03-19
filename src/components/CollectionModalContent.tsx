import React, { useState } from "react";
import ButtonOptions from "./ButtonOptions";
import ModifiersModal from "./ModifiersModal";

interface CollectionModalContentProps {}

const CollectionModalContent: React.FC<CollectionModalContentProps> = () => {
  const [isModifiersOpen, setIsModifiersOpen] = useState(false);

  const openModifiers = () => {
    setIsModifiersOpen(true);
  };

  const closeModifiers = () => {
    setIsModifiersOpen(false);
  };

  return (
    <>
      <div className="p-4 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Collection</h2>

        <div className="flex flex-col gap-4">
          <ButtonOptions
            variant="red"
            padding="py-2"
            onClick={openModifiers}
          >
            Modifiers
          </ButtonOptions>

          <ButtonOptions
            variant="red"
            padding="py-2"
            disabled={true}
          >
            Words
          </ButtonOptions>
          <p className="text-sm text-white text-center">coming soon!</p>
        </div>
      </div>

      {/* Modifiers Modal */}
      <ModifiersModal
        isOpen={isModifiersOpen}
        onClose={closeModifiers}
        isChildModal={true}
      />
    </>
  );
};

export default CollectionModalContent;
