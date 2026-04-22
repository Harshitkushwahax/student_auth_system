import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState({});
  const [course, setCourse] = useState("");
  const [pass, setPass] = useState({});
  const nav = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "https://student-auth-system-ne4a.onrender.com/api/dashboard",
        {
          headers: { Authorization: token }
        }
      );
      setUser(res.data);
    } catch {
      alert("Unauthorized");
      nav("/login");
    }
  };

  const updateCourse = async () => {
    await axios.put(
      "https://student-auth-system-ne4a.onrender.com/api/update-course",
      { course },
      { headers: { Authorization: token } }
    );
    alert("Course updated");
    fetchData();
  };

  const updatePassword = async () => {
    await axios.put(
      "https://student-auth-system-ne4a.onrender.com/api/update-password",
      pass,
      { headers: { Authorization: token } }
    );
    alert("Password updated");
  };

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Course: {user.course}</p>

      <h3>Update Course</h3>
      <input onChange={e => setCourse(e.target.value)} />
      <button onClick={updateCourse}>Update Course</button>

      <h3>Update Password</h3>
      <input placeholder="Old Password" onChange={e => setPass({...pass, oldPassword: e.target.value})}/>
      <input placeholder="New Password" onChange={e => setPass({...pass, newPassword: e.target.value})}/>
      <button onClick={updatePassword}>Update Password</button>

      <br /><br />
      <button onClick={logout}>Logout</button>
    </div>
  );
}