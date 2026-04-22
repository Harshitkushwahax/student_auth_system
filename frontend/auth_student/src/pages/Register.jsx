import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    try {
      await axios.post(
        "https://student-auth-system-ne4a.onrender.com/api/register",
        form
      );

      alert("Registered successfully");
      nav("/login");

    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      {error && <p>{error}</p>}

      <input placeholder="Name" onChange={e => setForm({...form, name: e.target.value})}/>
      <input placeholder="Email" onChange={e => setForm({...form, email: e.target.value})}/>
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})}/>
      <input placeholder="Course" onChange={e => setForm({...form, course: e.target.value})}/>

      <button onClick={submit}>Register</button>
    </div>
  );
}