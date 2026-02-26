import { useNavigate } from 'react-router-dom';

export default function Home() {
    // The steering wheel for navigation
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: "800px", margin: "40px auto", padding: "30px", fontFamily: "sans-serif", color: "#333" }}>
            
            {/* Header Section */}
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
                <h1 style={{ color: "#dc3545", fontSize: "2.8rem", marginBottom: "10px" }}>Team 1zko's 1v1 Coding Arena</h1>
                <p style={{ fontSize: "1.2rem", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
                    A high-performance, real-time multiplayer coding platform built to test your competitive programming skills under extreme pressure.
                </p>
            </div>

            {/* Info Cards Section */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "50px", flexWrap: "wrap" }}>
                
                {/* Features Card */}
                <div style={{ flex: 1, minWidth: "300px", padding: "25px", backgroundColor: "#f8f9fa", borderRadius: "8px", borderTop: "5px solid #dc3545", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ marginTop: 0, color: "#dc3545" }}>System Features</h3>
                    <ul style={{ paddingLeft: "20px", lineHeight: "1.8", fontSize: "1.05rem" }}>
                        <li><strong>Live Matchmaking:</strong> Lightning-fast opponent pairing based on Elo rating.</li>
                        <li><strong>Real-Time Arena:</strong> Instant synchronization of opponent typing and submission status.</li>
                        <li><strong>Competitive Leaderboards:</strong> Track your global ranking and match history.</li>
                        <li><strong>Pressure Engine:</strong> 45-minute strict time limits enforced securely on the backend.</li>
                    </ul>
                </div>

                {/* Tech Stack Card */}
                <div style={{ flex: 1, minWidth: "300px", padding: "25px", backgroundColor: "#f8f9fa", borderRadius: "8px", borderTop: "5px solid #28a745", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                    <h3 style={{ marginTop: 0, color: "#28a745" }}>Technology Stack</h3>
                    <ul style={{ paddingLeft: "20px", lineHeight: "1.8", fontSize: "1.05rem" }}>
                        <li><strong>Frontend:</strong> React.js, React Router DOM, WebSockets (SockJS/STOMP)</li>
                        <li><strong>Backend Engine:</strong> Java, Spring Boot, Spring WebSockets</li>
                        <li><strong>Matchmaking:</strong> Redis In-Memory Data Store (ZSets & Hashes)</li>
                        <li><strong>Architecture:</strong> Pub/Sub real-time messaging and RESTful APIs</li>
                    </ul>
                </div>

            </div>

            {/* Call to Action Buttons */}
            <div style={{ textAlign: "center", borderTop: "1px solid #ddd", paddingTop: "30px" }}>
                <h3 style={{ marginBottom: "20px", color: "#444" }}>Enter the Arena</h3>
                
                <button 
                    onClick={() => navigate('/loginUser')}
                    style={{ padding: "12px 24px", fontSize: "1.1rem", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", marginRight: "15px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                >
                    Player Login
                </button>
            </div>

        </div>
    );
}