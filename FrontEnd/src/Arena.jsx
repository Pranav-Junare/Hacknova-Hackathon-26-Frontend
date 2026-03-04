import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Editor from '@monaco-editor/react';
import { ReactFlow, addEdge, applyNodeChanges, applyEdgeChanges, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const btnStyle = { padding: '12px', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' };

export default function Arena() {
    const { mode, roomId } = useParams(); 
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const opponent = localStorage.getItem("opponent") || "Opponent";
    
    // 🔥 1. GRAB THE QUESTION ID FROM THE MATCHMAKER
    const questionId = localStorage.getItem("questionId") || "1"; 

    const [opponentStatus, setOpponentStatus] = useState("Waiting...");
    const [stompClient, setStompClient] = useState(null);

    // 🔥 2. DYNAMIC QUESTION STATE
    const [question, setQuestion] = useState({
        title: "Loading...",
        difficulty: "Loading...",
        description: "Fetching mission briefing...",
        boilerPlate: "// Loading..."
    });
    const [code, setCode] = useState("// Loading...");

    // --- SYSTEM DESIGN STATE ---
    const [nodes, setNodes] = useState([{ id: 'client-1', type: 'input', data: { label: '💻 Client User' }, position: { x: 250, y: 50 } }]);
    const [edges, setEdges] = useState([]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    
    const onConnect = useCallback((params) => { 
        setEdges((eds) => addEdge(params, eds)); 
        if (stompClient && stompClient.connected) {
            stompClient.send(`/app/arena/submit`, {}, JSON.stringify({ roomId, playerId: username, status: "TYPING", code: "active", mode, questionId }));
        }
    }, [stompClient, roomId, username, mode, questionId]);

    const addNode = (label, emoji) => {
        const newNode = {
            id: `node-${Date.now()}`,
            data: { label: `${emoji} ${label}` },
            position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
        };
        setNodes((nds) => [...nds, newNode]);
        if (stompClient && stompClient.connected) {
            stompClient.send(`/app/arena/submit`, {}, JSON.stringify({ roomId, playerId: username, status: "TYPING", code: "active", mode, questionId }));
        }
    };

    // 🔥 3. FETCH QUESTION DATA FROM SPRING BOOT
    useEffect(() => {
        if (mode === 'dsa') {
            fetch(`http://localhost:8080/api/questions/${questionId}`)
                .then(res => res.json())
                .then(data => {
                    setQuestion(data);
                    setCode(data.boilerPlate); // Inject the boilerplate from DB!
                })
                .catch(err => console.error("Failed to load question from DB:", err));
        }
    }, [mode, questionId]);

    // --- WEBSOCKETS ---
    useEffect(() => {
        if (!username) { navigate('/loginUser'); return; }

        const client = Stomp.over(() => new SockJS('http://localhost:8080/ws'));
        client.debug = () => {}; 

        client.connect({}, () => {
            client.subscribe(`/room/arena/${roomId}`, (message) => {
                const payload = JSON.parse(message.body);
                
                if (payload.type === "Game Over") {
                    if (payload.status === "VICTORY") {
                        if (payload.playerId === username) {
                            alert("🏆 YOU WIN! Perfect Solution!");
                        } else {
                            alert(`💀 DEFEAT! ${payload.playerId} solved it first!`);
                        }
                        
                        // 🔥 THE FIX: Wipe the slate clean for the next match!
                        localStorage.removeItem("questionId");
                        localStorage.removeItem("opponent");
                        
                        navigate('/dashboard'); 
                    } 
                    else if (payload.status === "FAILED" && payload.playerId === username) {
                        alert("❌ Validation Failed. Try again!");
                        setOpponentStatus("Online");
                    }
                } 
                else if (payload.type === "Opponent Status" && payload.playerId !== username) {
                    if (payload.status === "TYPING") {
                        setOpponentStatus(mode === "dsa" ? "Typing..." : "Building...");
                        setTimeout(() => setOpponentStatus("Online"), 2000); 
                    } else if (payload.status === "SUBMITTED") {
                        setOpponentStatus("🚨 SUBMITTED!");
                    }
                }
            });
        });

        setStompClient(client);
        return () => { if (client) client.disconnect(); };
    }, [roomId, username, navigate, mode]);

    // --- SUBMIT HANDLERS ---
    const handleDsaSubmit = () => {
        if (stompClient && stompClient.connected) {
            // 🔥 SEND THE QUESTION ID TO THE COMPILER
            stompClient.send(`/app/arena/submit`, {}, JSON.stringify({ roomId, playerId: username, status: "SUBMITTED", code: code, mode: "dsa", questionId }));
            alert("Running test cases... Please wait.");
        }
    };

    const handleDesignSubmit = () => {
        if (stompClient && stompClient.connected) {
            const architecture = JSON.stringify({ nodes, edges });
            // 🔥 SEND THE QUESTION ID TO THE DESIGN EVALUATOR
            stompClient.send(`/app/arena/submit`, {}, JSON.stringify({ roomId, playerId: username, status: "SUBMITTED", code: architecture, mode: "design", questionId }));
            alert("Evaluating System Architecture...");
        }
    };

    if (mode === "design") {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: 'white', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#252526', borderBottom: '2px solid #333' }}>
                    <h3 style={{ margin: 0, color: '#4CAF50' }}>🟢 {username}</h3>
                    <h3 style={{ margin: 0, color: '#f39c12' }}>⚙️ SYSTEM DESIGN ARENA ⚙️</h3>
                    <h3 style={{ margin: 0, color: opponentStatus === "Building..." ? '#ff9800' : '#f44336' }}>🔴 {opponent} ({opponentStatus})</h3>
                </div>
                
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ width: '280px', padding: '20px', backgroundColor: '#252526', display: 'flex', flexDirection: 'column', gap: '15px', borderRight: '2px solid #333', zIndex: 10 }}>
                        <h2 style={{ marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Mission: 10k RPS</h2>
                        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.5' }}>
                            Design a scalable API. You must include a <strong>Load Balancer</strong>, a <strong>Server</strong>, and a <strong>Database</strong>, and wire them together.
                        </p>
                        
                        <button onClick={() => addNode('Load Balancer', '⚖️')} style={btnStyle}>⚖️ Add Load Balancer</button>
                        <button onClick={() => addNode('Server', '🖥️')} style={btnStyle}>🖥️ Add Server</button>
                        <button onClick={() => addNode('Database', '🗄️')} style={btnStyle}>🗄️ Add Database</button>
                        
                        <button onClick={handleDesignSubmit} style={{ ...btnStyle, backgroundColor: '#28a745', marginTop: 'auto', padding: '15px', fontSize: '16px' }}>
                            Deploy Architecture 🚀
                        </button>
                    </div>

                    <div style={{ flex: 1, height: '100%', width: '100%', position: 'relative', backgroundColor: '#121212' }}>
                        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} theme="dark" fitView>
                            <Background color="#333" gap={16} />
                            <Controls style={{ fill: 'white', backgroundColor: '#222' }} />
                        </ReactFlow>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === "dsa") {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#252526', borderBottom: '2px solid #333' }}>
                    <h3 style={{ margin: 0, color: '#4CAF50' }}>🟢 {username}</h3>
                    <h3 style={{ margin: 0, color: '#f39c12' }}>💻 DSA ARENA 💻</h3>
                    <h3 style={{ margin: 0, color: opponentStatus === "Typing..." ? '#ff9800' : '#f44336' }}>🔴 {opponent} ({opponentStatus})</h3>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <div style={{ flex: 1, padding: '20px', borderRight: '2px solid #333', overflowY: 'auto', backgroundColor: '#1e1e1e' }}>
                        {/* 🔥 DYNAMIC QUESTION INJECTED HERE */}
                        <h1 style={{ marginTop: 0 }}>{question.title}</h1>
                        <span style={{ backgroundColor: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{question.difficulty}</span>
                        <p style={{ fontSize: '16px', lineHeight: '1.6', marginTop: '20px', whiteSpace: 'pre-wrap' }}>
                            {question.description}
                        </p>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language="cpp"
                                value={code}
                                onChange={(v) => { 
                                    setCode(v); 
                                    if (stompClient && stompClient.connected) {
                                        stompClient.send(`/app/arena/submit`, {}, JSON.stringify({ roomId, playerId: username, status: "TYPING", code: "active", mode, questionId }));
                                    }
                                }}
                                options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: "on" }}
                            />
                        </div>
                        <div style={{ padding: '15px', backgroundColor: '#252526', borderTop: '2px solid #333', textAlign: 'right' }}>
                            <button onClick={handleDsaSubmit} style={{ padding: '10px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Run & Submit 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <h1 style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Arena...</h1>;
}