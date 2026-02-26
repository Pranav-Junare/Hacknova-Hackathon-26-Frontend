import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){

    // The email and password to be sent
    const[email, setEmail]=useState("");
    const[password, setPassword]=useState("");

    // The error message if not found
    const[message, setMessage]=useState("");
    const navigate=useNavigate();

    // Navigate to dashboard after login
    const handleLogin=(e)=>{

        e.preventDefault();

        fetch("http://localhost:8080/loginUser",{
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            credentials:'include',
            body:JSON.stringify({userEmail:email,password:password})
        }).then(response=>{
            if(response.ok){
                return response.json().then(data=>{
                    setMessage("Login in successful, welcome "+data.name);
                    setTimeout(()=>{
                        navigate('/dashboard')},1500);
                });
            }
            else{
                return response.json().then(data=>{
                    setMessage("Loggin failed, "+data.error)
                });
            }
        }).catch(error=>{
            setMessage("Cannot connect to the server right now");
        });

    };
    return (
        <>  
        <div style={{ maxWidth: "350px", margin: "50px auto", padding: "20px", border: "2px solid #0056b3", borderRadius: "8px", fontFamily: "sans-serif" }}>
            <h2 style={{ color: "#0056b3", textAlign: "center" }}>User Login</h2>
            
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "15px" }}>
                    <label><strong>Email Address:</strong></label>
                    <br />
                    <input 
                        type="text" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "8px", marginTop: "5px", boxSizing: "border-box" }}
                        placeholder="you@email.com"
                    />
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                    <label><strong>Password:</strong></label>
                    <br />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "8px", marginTop: "5px", boxSizing: "border-box" }}
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ width: "100%", padding: "10px", backgroundColor: "#0056b3", color: "white", fontWeight: "bold", border: "none", cursor: "pointer", borderRadius: "4px" }}
                >
                    Sign In
                </button>
            </form>

            {/* Display the Spring Boot response message here */}
            <p style={{ marginTop: "20px", fontWeight: "bold", textAlign: "center", minHeight: "20px" }}>
                {message}
            </p>
             <div style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
                Need an account? <span style={{ color: "darkred", cursor: "pointer", textDecoration: "underline" }} onClick={() => navigate('/signup')}>Register here</span>
            </div>
        </div>
        </>
    )
}