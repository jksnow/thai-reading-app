import React, { useState } from "react";
import SocialMediaButtons from "./SocialMediaButtons";
import GlobalButtonContainer from "./GlobalButtonContainer";

const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger button - fixed at bottom center on mobile */}
      <button
        onClick={toggleMenu}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-gray-800 p-3 rounded-full shadow-lg md:hidden"
        aria-label="Toggle mobile menu"
        style={{
          boxShadow: "2px 3px 0 rgba(0, 0, 0, 0.9)",
        }}
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`bg-white h-0.5 w-full transform transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`bg-white h-0.5 w-full transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`bg-white h-0.5 w-full transform transition-transform duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </div>
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-30 md:hidden flex items-end"
          onClick={toggleMenu}
        >
          <div
            className="w-full mx-auto bg-gray-800 rounded-t-xl p-5 border-t-2 border-x-2 border-gray-300 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0px -3px 5px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Mobile version of GlobalButtonContainer */}
            <div className="mb-8">
              <h3 className="text-white text-xl mb-4 font-bold text-center">
                Menu
              </h3>
              <div className="flex flex-col space-y-3">
                <GlobalButtonContainer isMobile={true} />
              </div>
            </div>

            {/* Mobile version of SocialMediaButtons */}
            <div className="border-t border-gray-600 pt-6">
              <h3 className="text-white text-xl mb-4 font-bold text-center">
                Connect
              </h3>
              <SocialMediaButtons isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
