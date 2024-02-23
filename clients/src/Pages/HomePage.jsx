import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleJoinedRoom = useCallback(
    (data) => {
      const { roomId } = data;
      navigate(`/room/${roomId}`);
    },
    [navigate]
  );

  // #2-a- => Sending the user to the room specified
  useEffect(() => {
    socket.on("joined-room", handleJoinedRoom);
    return () => {
      socket.off("joined-room", handleJoinedRoom);
    };
  }, [socket, handleJoinedRoom]);

  ///  #1 => All details are filled backend request is made to join the room
  function handleClick() {
    socket.emit("join-room", { roomId: roomId, emailId: email });
  }

  return (
    <div className="homepage-container">
      <div className="input-container">
        <input
          placeholder="Enter your Email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        ></input>
        <input
          placeholder="Enter your Room Number"
          onChange={(e) => {
            setRoomId(e.target.value);
          }}
        ></input>
        <button onClick={handleClick}>Enter Room</button>
      </div>
    </div>
  );
}
