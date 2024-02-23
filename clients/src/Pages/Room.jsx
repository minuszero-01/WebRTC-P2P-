import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../providers/Socket";
import ReactPlayer from "react-player";
import peer from "../providers/Peer";
import { Socket } from "socket.io-client";

export function Room() {
  const { socket } = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState();
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  /// Handling all the socket calls or onClick calls all fuction are written in order

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleUserJoined = useCallback((data) => {
    const { emailId, id } = data;
    console.log("email : ", emailId, " id ", id, " Joined the room");
    setRemoteSocketId(id);
  }, []);

  // Clicking on call button
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    console.log(stream);
    socket.emit("call-user", { to: remoteSocketId, offer });
    setMyStream(stream);
    console.log(myStream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async (data) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(myStream);

      const { from, offer } = data;
      setRemoteSocketId(from);
      const ans = await peer.getAnswer(offer);
      socket.emit("call-accepted", { to: from, ans });
    },
    [socket]
  );

  const handleStream = useCallback(async () => {
    const tracks = myStream.getTracks();
    for (const track of tracks) {
      peer.peer.addTrack(track, myStream);
    }
    console.log("got track");
  }, [myStream]);

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      await peer.setLocalDescription(ans);
      console.log("call Accepted");
      handleStream();
    },
    [handleStream]
  );

  const handleNego = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer-nego", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNego);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNego);
    };
  }, []);

  const handleUserNego = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer-nego-done", { ans, to: from });
    },
    [socket]
  );

  const handleFinalNego = useCallback(async ({ from, ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  //  #2 - b - If any user1 exist and user2 joined so it is broadcasted
  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("peer-nego", handleUserNego);
    socket.on("peer-nego-final", handleFinalNego);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("peer-nego", handleUserNego);
      socket.off("peer-nego-final", handleFinalNego);
    };
  }, [socket, handleUserJoined, handleCallAccepted, handleFinalNego]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteS = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteS[0]);
    });
  }, []);

  return (
    <div>
      <h3>
        {remoteSocketId ? "Someone wants to connect" : "No one in the Room"}
      </h3>
      {myStream && <button onClick={handleStream}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && (
        <>
          <h4>My Video</h4>
          <ReactPlayer url={myStream} playing muted height={300} width={300} />
        </>
      )}
      {remoteStream && (
        <>
          <h4>Remote Video</h4>
          <ReactPlayer
            url={remoteStream}
            playing
            muted
            height={300}
            width={300}
          />
        </>
      )}
    </div>
  );
}
