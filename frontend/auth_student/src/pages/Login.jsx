import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [data, setData] = useState({});
  const [error, setError] = useState("");
  const nav = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post(
        "https://student-auth-system-ne4a.onrender.com/api/login",
        data
      );

      localStorage.setItem("token", res.data.token);
      nav("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      {error && <p>{error}</p>}

      <input placeholder="Email" onChange={e => setData({...data, email: e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e => setData({...data, password: e.target.value})}/>

      <button onClick={login}>Login</button>
    </div>
  );
}