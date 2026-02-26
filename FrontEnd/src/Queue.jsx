import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const Queue = () => {
    const [username, setUsername] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        return () => { if (stompClient) stompClient.disconnect(); };
    }, [stompClient]);

    const findMatch = () => {
        if (!username) return alert("Enter a username!");
        
        setIsSearching(true);
        localStorage.setItem("username", username); 

        const client = Stomp.over(() => new SockJS('http://localhost:8080/ws'));
        client.debug = () => {}; 

        client.connect({}, () => {
            console.log("Connected to lobby WebSocket!");
            
            client.subscribe(`/room/match/${username}`, (message) => {
                const payload = JSON.parse(message.body);
                console.log("🚨 MATCH FOUND!", payload);
                
                localStorage.setItem("opponent", payload.opponent);

                client.disconnect(); 
                navigate(`/arena/${payload.roomId}`); 
            });

            axios.post(`http://localhost:8080/match/join?userName=${username}&points=1200`)
                .then(res => console.log("Joined Redis Queue:", res.data))
                .catch(err => console.error(err));
        });

        setStompClient(client);
    };

    // NEW FUNCTION: The Escape Hatch
    const leaveQueue = () => {
        // 1. Tell Spring Boot to delete us from Redis
        axios.post(`http://localhost:8080/match/leave?userName=${username}`)
            .then(res => console.log("Left Queue:", res.data))
            .catch(err => console.error(err));

        // 2. Hang up the Walkie-Talkie
        if (stompClient) {
            stompClient.disconnect();
            setStompClient(null);
        }

        // 3. Reset the UI
        setIsSearching(false);
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
                    <button onClick={findMatch} style={{ padding: '10px 20px', cursor: 'pointer', background: 'green', color: 'white', border: 'none', borderRadius: '5px' }}>
                        Find Match
                    </button>
                </div>
            ) : (
                <div style={{ color: 'orange' }}>
                    <h2>Searching for opponent...</h2>
                    <p>Listening to Redis Queue...</p>
                    <br/>
                    {/* NEW BUTTON: The Cancel Button */}
                    <button onClick={leaveQueue} style={{ padding: '10px 20px', cursor: 'pointer', background: 'red', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
                        ❌ Cancel Search
                    </button>
                </div>
            )}
        </div>
    );
};

export default Queue;