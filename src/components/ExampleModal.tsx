import React, { useState } from "react";
import ModalContainer from "./ModalContainer";
import ButtonOptions from "./ButtonOptions";

const ExampleModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <ButtonOptions
        onClick={openModal}
        variant="primary"
      >
        Open Example Modal
      </ButtonOptions>

      <ModalContainer
        isOpen={isModalOpen}
        onClose={closeModal}
        size="small" // or "large"
      >
        <div className="text-white p-4">
          <h2 className="text-2xl font-bold mb-4">Example Modal Content</h2>
          <p>This is an example of content inside the modal container.</p>
          <p className="mt-4">
            The modal has a consistent style with a BACK button at the bottom.
          </p>
        </div>
      </ModalContainer>
    </div>
  );
};

export default ExampleModal;
