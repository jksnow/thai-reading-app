import React from "react";
import thaiTaleLogo from "../assets/v1e.png";
import GlobalButtonContainer from "./GlobalButtonContainer";
import ChatBubble from "./ChatBubble";

const MainTitleScreen: React.FC = () => {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      {/* Logo and Title - Large, taking significant screen real estate */}
      <div className="flex items-center justify-center mb-16 relative">
        <h1
          className="special-text text-white inline-flex items-center"
          style={{
            fontSize: "16rem",
            textShadow: "0.025em 0.025em 0 gray, 0.05em 0.05em 0 black",
          }}
        >
          Thai
          <div className="relative">
            <img
              src={thaiTaleLogo}
              alt="Thai Tale Logo"
              className="mx-6 w-auto"
              style={{ height: "20rem" }}
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
