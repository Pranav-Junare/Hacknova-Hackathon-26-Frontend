import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios'; 

export default function Queue() {
    const navigate = useNavigate();
    
    // 1. THE CATCHER'S MITT: Grab the mode from the Dashboard!
    const location = useLocation();
    const mode = location.state?.mode || 'dsa'; // Defaults to DSA if they somehow bypass the dashboard
    
    const username = localStorage.getItem("username");
    const [status, setStatus] = useState("Connecting to server...");

    useEffect(() => {
        if (!username) { navigate('/loginUser'); return; }

        const client = Stomp.over(() => new SockJS('http://localhost:8080/ws'));
        client.debug = () => {}; // Mute standard logs

        client.connect({}, () => {
            setStatus(`Searching for ${mode.toUpperCase()} opponent...`);

            // 2. LISTEN FOR THE MATCH
            client.subscribe(`/room/match/${username}`, (message) => {
                const payload = JSON.parse(message.body);
                localStorage.setItem("opponent", payload.opponent);
                
                // 🔥 THE CRITICAL FIX: Save the Question ID!
                if (payload.questionId) {
                    localStorage.setItem("questionId", payload.questionId);
                }
                
                // 3. WARP TO THE CORRECT ARENA MODE!
                navigate(`/arena/${payload.mode}/${payload.roomId}`);
            });

            // 4. TELL SPRING BOOT WHICH QUEUE TO JOIN
            console.log(mode);
            axios.post('http://localhost:8080/api/queue/join', { 
                username: username,
                mode: mode 
            }, { withCredentials: true })
            .then(() => console.log(`Successfully joined the ${mode} queue!`))
            .catch(err => console.error("Failed to join queue:", err));
        });

        // Cleanup when they leave the page
        return () => {
            if (client) client.disconnect();
        };
    }, [username, navigate, mode]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'sans-serif' }}>
            
            {/* Dynamic Icon based on Mode */}
            <h1 style={{ fontSize: '60px', margin: '0 0 20px 0' }}>
                {mode === 'dsa' ? '💻' : '⚙️'}
            </h1>
            
            <h2 style={{ color: '#4CAF50' }}>{status}</h2>
            
            {/* Simple CSS Spinner */}
            <div style={{ marginTop: '20px', width: '50px', height: '50px', border: '5px solid #333', borderTop: '5px solid #f39c12', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            
        </div>
    );
}