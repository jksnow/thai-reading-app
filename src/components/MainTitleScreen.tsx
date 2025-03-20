import React from "react";
import thaiTaleLogo from "../assets/v1e.png";
import GlobalButtonContainer from "./GlobalButtonContainer";
import ChatBubble from "./ChatBubble";

const MainTitleScreen: React.FC = () => {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      {/* Logo and Title - Large, taking significant screen real estate */}
      <div className="flex items-center justify-center mb-8 md:mb-16 relative">
        <h1
          className="special-text text-white inline-flex items-center flex-wrap justify-center"
          style={{
            fontSize: "clamp(4rem, 12vw, 16rem)",
            textShadow: "0.025em 0.025em 0 gray, 0.05em 0.05em 0 black",
          }}
        >
          Thai
          <div className="relative mx-2 md:mx-6">
            <img
              src={thaiTaleLogo}
              alt="Thai Tale Logo"
              className="w-auto h-[8rem] sm:h-[12rem] md:h-[13rem] lg:h-[20rem]"
            />
            <ChatBubble />
          </div>
          Tale
        </h1>
      </div>

      {/* Global Button Container positioned in center for home screen */}
      <div className="flex justify-center">
        <GlobalButtonContainer />
      </div>
    </div>
  );
};

export default MainTitleScreen;
