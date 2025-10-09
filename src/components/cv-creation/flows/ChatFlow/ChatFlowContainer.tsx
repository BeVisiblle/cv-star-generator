import { useState } from "react";
import ChatInterface from "./ChatInterface";

export default function ChatFlowContainer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <ChatInterface />
    </div>
  );
}
