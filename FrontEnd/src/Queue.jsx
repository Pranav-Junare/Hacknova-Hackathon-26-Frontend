import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const Queue = () => {
    const [username, setUsername] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    // We store the stompClient in state so we can disconnect it when we leave the page
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        // Cleanup function when component unmounts
        return () => { if (stompClient) stompClient.disconnect(); };
    }, [stompClient]);

    const findMatch = () => {
        if (!username) return alert("Enter a username!");
        
        setIsSearching(true);
        localStorage.setItem("username", username); // Save it so the Arena page knows who we are

        // 1. Connect the Walkie-Talkie FIRST
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);
        client.debug = () => {}; // Mutes the annoying console logs

        client.connect({}, () => {
            console.log("Connected to lobby WebSocket!");
            
            // 2. Listen to your personal channel! (Notice the /room/ prefix you configured)
            client.subscribe(`/room/match/${username}`, (message) => {
                const payload = JSON.parse(message.body);
                console.log("🚨 MATCH FOUND!", payload);
                
                // Save opponent name to local storage to show in the UI later
                localStorage.setItem("opponent", payload.opponent);

                // 3. Jump to the Arena!
                client.disconnect(); // Hang up this radio
                navigate(`/arena/${payload.roomId}`); // Change the URL
            });

            // 4. AFTER WebSocket is listening, send the HTTP POST to join the Redis Queue
            axios.post(`http://localhost:8080/match/join?userName=${username}&points=1200`)
                .then(res => console.log("Joined Redis Queue:", res.data))
                .catch(err => console.error(err));
        });

        setStompClient(client);
    };

    return (
        <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'monospace' }}>
            <h1>⚔️ 1v1 Coding Arena</h1>
            {!isSearching ? (
                <div>
                    <input 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="Enter Username..." 
                        style={{ padding: '10px', fontSize: '16px' }}
                    />
                    <br/><br/>
                    <button onClick={findMatch} style={{ padding: '10px 20px', cursor: 'pointer', background: 'green', color: 'white' }}>
                        Find Match
                    </button>
                </div>
            ) : (
                <div style={{ color: 'orange' }}>
                    <h2>Searching for opponent...</h2>
                    <p>Listening to Redis Queue...</p>
                </div>
            )}
        </div>
    );
};

export default Queue;