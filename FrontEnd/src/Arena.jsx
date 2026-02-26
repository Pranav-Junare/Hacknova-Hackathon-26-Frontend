import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const Arena = () => {
    const { roomId } = useParams(); // Grabs the UUID from the URL
    const navigate = useNavigate();
    
    const [stompClient, setStompClient] = useState(null);
    const [opponentStatus, setOpponentStatus] = useState("IDLE");
    
    // Retrieve the names we saved in Queue.jsx
    const username = localStorage.getItem("username");
    const opponent = localStorage.getItem("opponent");

    useEffect(() => {
        if (!username) { navigate("/"); return; } // Kick them out if they refresh and lose localstorage

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = () => {};

        client.connect({}, () => {
            console.log("⚔️ Connected to Arena: " + roomId);

            // 1. Listen to the shared room channel
            client.subscribe(`/room/arena/${roomId}`, (message) => {
                const payload = JSON.parse(message.body);
                
                // If the message is from the ENEMY, update their status on my screen
                if (payload.playerId !== username) {
                    setOpponentStatus(payload.status);
                }

                // Did someone win?
                if (payload.status === "SUBMITTED") {
                    if (payload.playerId === username) alert("🏆 YOU WON!");
                    else alert("💀 YOU LOST! Opponent finished first.");
                    navigate("/"); // Send back to lobby
                }
            });
        });

        setStompClient(client);
        return () => { if (client) client.disconnect(); };
    }, [roomId, username, navigate]);

    // 2. Function to blast your status to the server
    const sendStatus = (newStatus) => {
        if (stompClient && stompClient.connected) {
            const payload = {
                roomId: roomId,
                playerId: username,
                status: newStatus
            };
            // Send to the backend @MessageMapping endpoint
            stompClient.send("/app/arena/submit", {}, JSON.stringify(payload));
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h2>🔴 LIVE ARENA: Room {roomId.substring(0,8)}...</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#eee' }}>
                <div>
                    <h3>😎 You ({username})</h3>
                    <button onClick={() => sendStatus("TYPING")}>Simulate Typing</button>
                    <button onClick={() => sendStatus("IDLE")}>Simulate Idle</button>
                    <br/><br/>
                    <button onClick={() => sendStatus("SUBMITTED")} style={{ background: 'red', color: 'white' }}>
                        SUBMIT FINAL CODE
                    </button>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <h3>😈 Opponent ({opponent})</h3>
                    {/* THIS IS THE MAGIC - It updates instantly based on WebSockets! */}
                    <h2 style={{ color: opponentStatus === 'TYPING' ? 'green' : 'gray' }}>
                        Status: {opponentStatus}
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default Arena;