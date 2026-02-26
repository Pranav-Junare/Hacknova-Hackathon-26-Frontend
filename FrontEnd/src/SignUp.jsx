import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp(){

    const[name,setName]=useState("");
    const[email,setEmail]=useState("");
    const[password,setPassword]=useState("");
    const [feedback, setFeedback] = useState("");

    const navigate=useNavigate();

    const handleSignup=(e)=>{

        e.preventDefault();

        fetch("http://localhost:8080/signup",{
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            credentials:'include',
            body:JSON.stringify({username:name, userEmail:email, password:password})
        })
        .then(respone=>{
            if(respone.ok){
                return respone.json().then(data=>{
                    setFeedback("✅ " + data.message + " Redirecting...");
                    setTimeout(() => navigate('/login'), 2000);
                });
            }
            else{
                return respone.json().then(data=>{
                    // CHANGED FROM setError to setFeedback
                    setFeedback("❌ " + data.error); 
                })
            }
        })
        .catch(error=>{
            // CHANGED FROM setError to setFeedback
            setFeedback("🚨 Cannot connect to the backend"); 
        });
    };
    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "2px solid #28a745", borderRadius: "8px", fontFamily: "sans-serif" }}>
            <h2 style={{ color: "#28a745", textAlign: "center", marginBottom: "20px" }}>Create an Account</h2>
            
            <form onSubmit={handleSignup}>
                <div style={{ marginBottom: "15px" }}>
                    <label><strong>Full Name:</strong></label>
                    <br />
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                        placeholder="John Doe"
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label><strong>Email Address:</strong></label>
                    <br />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                        placeholder="you@email.com"
                    />
                </div>
                
                <div style={{ marginBottom: "25px" }}>
                    <label><strong>Password:</strong></label>
                    <br />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px", fontSize: "16px" }}
                >
                    Register
                </button>
            </form>

            {/* Display the success or error message here */}
            <p style={{ marginTop: "20px", fontWeight: "bold", textAlign: "center", minHeight: "20px" }}>
                {feedback}
            </p>

            {/* Link back to login if they already have an account */}
            <div style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
                Already have an account? <span style={{ color: "#0056b3", cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate('/login')}>Log in here</span>
            </div>
        </div>
    );
}