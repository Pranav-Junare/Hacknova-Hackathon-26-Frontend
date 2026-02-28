import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

export default function Dashboard(){
    const [name, setName] = useState("");
    const [points, setPoint] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate(); 

    useEffect(() => {
        fetch("http://localhost:8080/dashboard", {
            method: "GET",
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            cache: 'no-store' // 👈 THIS FIXES THE STALE ELO BUG! Forces a fresh DB check.
        })
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {
                    setPoint(data.points);
                    setName(data.name);
                    
                    // CRITICAL: Save the username so Queue and Arena know who you are!
                    localStorage.setItem("username", data.name);
                });
            } else {
                return response.json().then(data => {
                    setError(data.error);
                });
            }
        })
        .catch(error => {
            setError("Can not connect to the server right now");
        });
    }, []);

    return (
        <div style={{ maxWidth: "500px", margin: "50px auto", padding: "30px", border: "2px solid #28a745", borderRadius: "10px", fontFamily: "sans-serif", textAlign: "center" }}>
            
            {error ? (
                <div>
                    <h2 style={{ color: "red" }}>🚨 Access Denied</h2>
                    <p><strong>{error}</strong></p>
                    <p>Please return to the login page.</p>
                    
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ marginTop: "15px", padding: "10px 20px", backgroundColor: "#0056b3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                        Go to Login
                    </button>
                </div>
            ) : (
                <div>
                    <h2 style={{ color: "#28a745", marginBottom: "5px" }}>Customer Dashboard</h2>
                    <h1 style={{ marginTop: "0" }}>Welcome, {name}!</h1>
                    
                    <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", marginTop: "20px", marginBottom: "25px" }}>
                        <p style={{ fontSize: "18px", margin: "0" }}>Points (Elo)</p>
                        <h2 style={{ fontSize: "36px", color: "#333", margin: "10px 0 0 0" }}>
                            {points}
                        </h2>
                    </div>

                    {/* NEW: DUAL MODE BUTTONS */}
                    <h3 style={{ marginTop: "20px", marginBottom: "10px", color: "#555" }}>Select Battleground</h3>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button 
                            onClick={() => navigate('/queue', { state: { mode: 'dsa' } })} 
                            style={{ flex: 1, padding: "12px", backgroundColor: "#28a745", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px", fontSize: "16px" }}
                        >
                            💻 1v1 DSA
                        </button>
                        
                        <button 
                            onClick={() => navigate('/queue', { state: { mode: 'design' } })} 
                            style={{ flex: 1, padding: "12px", backgroundColor: "#f39c12", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px", fontSize: "16px" }}
                        >
                            ⚙️ 1v1 Design
                        </button>
                    </div>
                    
                </div>
            )}
            
        </div>
    );
}