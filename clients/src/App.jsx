import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./Pages/HomePage";
import { SocketProvider } from "./providers/Socket";
import { Room } from "./Pages/Room";
//  import { PeerProvider } from "./providers/Peer";

function App() {
  return (
    <div>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </SocketProvider>
    </div>
  );
}

export default App;
