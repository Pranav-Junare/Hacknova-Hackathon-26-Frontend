import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const Queue = () => {
    // Automatically grab the logged-in username! No more typing.
    const username = localStorage.getItem("username"); 
    
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        // If they bypassed the login screen, kick them out
        if (!username) { navigate('/loginUser'); }
        return () => { if (stompClient) stompClient.disconnect(); };
    }, [stompClient, username, navigate]);

    const findMatch = () => {
        setIsSearching(true);

        const client = Stomp.over(() => new SockJS('http://localhost:8080/ws'));

        client.connect({}, () => {
            console.log("Connected to lobby WebSocket!");
            
            client.subscribe(`/room/match/${username}`, (message) => {
                const payload = JSON.parse(message.body);
                localStorage.setItem("opponent", payload.opponent);
                client.disconnect(); 
                navigate(`/arena/${payload.roomId}`); 
            });

            // Cleaned up Axios! No parameters needed, just send the cookie!
            axios.post(`http://localhost:8080/match/join`, {}, { withCredentials: true })
                .then(res => console.log("Joined Redis Queue:", res.data))
                .catch(err => console.error(err));
        });

        setStompClient(client);
    };

    const leaveQueue = () => {
        // Cleaned up Axios!
        axios.post(`http://localhost:8080/match/leave`, {}, { withCredentials: true })
            .then(res => console.log("Left Queue:", res.data))
            .catch(err => console.error(err));

        if (stompClient) {
            stompClient.disconnect();
            setStompClient(null);
        }
        setIsSearching(false);
    };

    return (
        <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'monospace' }}>
            <h1>⚔️ 1v1 Coding Arena</h1>
            {!isSearching ? (
                <div>
                    <h2>Ready, {username}?</h2>
                    <br/>
                    <button onClick={findMatch} style={{ padding: '15px 30px', cursor: 'pointer', background: 'green', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px' }}>
                        Find Match
                    </button>
                </div>
            ) : (
                <div style={{ color: 'orange' }}>
                    <h2>Searching for opponent...</h2>
                    <p>Listening to Redis Queue...</p>
                    <br/>
                    <button onClick={leaveQueue} style={{ padding: '10px 20px', cursor: 'pointer', background: 'red', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
                        ❌ Cancel Search
                    </button>
                </div>
            )}
        </div>
    );
};

export default Queue;