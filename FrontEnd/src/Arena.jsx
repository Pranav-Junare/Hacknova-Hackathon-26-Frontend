import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Editor from '@monaco-editor/react';

export default function Arena() {
    const { roomId } = useParams(); 
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const opponent = localStorage.getItem("opponent") || "Opponent";

    const [code, setCode] = useState("#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}");
    const [opponentStatus, setOpponentStatus] = useState("Waiting...");
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        if (!username) { navigate('/loginUser'); return; }

        const client = Stomp.over(() => new SockJS('http://localhost:8080/ws'));
        client.debug = () => {}; 

        client.connect({}, () => {
            client.subscribe(`/room/arena/${roomId}`, (message) => {
                const payload = JSON.parse(message.body);
                
                // 1. GAME OVER LOGIC (From the Judge)
                if (payload.type === "Game Over") {
                    if (payload.status === "VICTORY") {
                        if (payload.playerId === username) {
                            alert("🏆 YOU WIN! All test cases passed!");
                        } else {
                            alert(`💀 DEFEAT! ${payload.playerId} solved it first!`);
                        }
                        navigate('/dashboard'); // Kick them back to lobby
                    } 
                    else if (payload.status === "FAILED" && payload.playerId === username) {
                        alert("❌ Wrong Answer. Try again!");
                        setOpponentStatus("Online");
                    }
                } 
                // 2. TYPING / STATUS LOGIC
                else if (payload.type === "Opponent Status" && payload.playerId !== username) {
                    if (payload.status === "TYPING") {
                        setOpponentStatus("Typing...");
                        setTimeout(() => setOpponentStatus("Online"), 2000); 
                    } else if (payload.status === "SUBMITTED") {
                        setOpponentStatus("🚨 SUBMITTED CODE!");
                    }
                }
            });
        });

        setStompClient(client);
        return () => { if (client) client.disconnect(); };
    }, [roomId, username, navigate]);

    // UPDATED: Now sends to the unified '/app/arena/submit' endpoint!
    const handleCodeChange = (value) => {
        setCode(value);
        if (stompClient && stompClient.connected) {
            stompClient.send(`/app/arena/submit`, {}, JSON.stringify({
                roomId: roomId,
                playerId: username,
                status: "TYPING",
                code: value
            }));
        }
    };

    // NEW: The Submit Function!
    const handleSubmit = () => {
        if (stompClient && stompClient.connected) {
            stompClient.send(`/app/arena/submit`, {}, JSON.stringify({
                roomId: roomId,
                playerId: username,
                status: "SUBMITTED",
                code: code 
            }));
            // Show a quick alert so the user knows it's thinking
            alert("Running test cases... Please wait.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'sans-serif' }}>
            
            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#252526', borderBottom: '2px solid #333' }}>
                <h3 style={{ margin: 0, color: '#4CAF50' }}>🟢 {username}</h3>
                <h3 style={{ margin: 0, color: '#f39c12' }}>⚔️ ARENA ⚔️</h3>
                <h3 style={{ margin: 0, color: opponentStatus === "Typing..." ? '#ff9800' : '#f44336' }}>
                    🔴 {opponent} ({opponentStatus})
                </h3>
            </div>

            {/* MAIN SPLIT SCREEN */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                
                {/* LEFT PANEL: Problem Statement */}
                <div style={{ flex: 1, padding: '20px', borderRight: '2px solid #333', overflowY: 'auto', backgroundColor: '#1e1e1e' }}>
                    <h1 style={{ marginTop: 0 }}>1. Two Sum</h1>
                    <span style={{ backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Easy</span>
                    <p style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '20px' }}>
                        Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                    </p>
                    <div style={{ backgroundColor: '#2d2d2d', padding: '15px', borderRadius: '5px', marginTop: '20px', fontFamily: 'monospace' }}>
                        <strong>Input:</strong> nums = [2,7,11,15], target = 9<br/>
                        <strong>Output:</strong> [0,1]
                    </div>
                </div>

                {/* RIGHT PANEL: Monaco Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                        <Editor
                            height="100%"
                            theme="vs-dark"
                            language="cpp"
                            value={code}
                            onChange={handleCodeChange}
                            options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: "on" }}
                        />
                    </div>
                    
                    {/* BOTTOM RIGHT: Submit Button with onClick attached! */}
                    <div style={{ padding: '15px', backgroundColor: '#252526', borderTop: '2px solid #333', textAlign: 'right' }}>
                        <button onClick={handleSubmit} style={{ padding: '10px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Run & Submit 🚀
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}