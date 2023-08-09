import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { setWebSocketConnection, setWebSocketUUID } from "./Websocket";

const Join = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');


const handleChange = (e) => {
    setCode(e.target.value);
}

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(`http://localhost:3000/join?code=${code}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
    }
    const data = await response.json();
    const ws = new WebSocket(`ws://localhost:3002/?isProfessor=false&session_id=${data.session_id}&ws_uuid=${data.ws_uuid}`);
    setWebSocketConnection(ws);
    setWebSocketUUID(data.ws_uuid);
    navigate(`/ask/${data.session_id}`,
            { state: {session_id: data.session_id,
                      session_title: data.session_title,
                      student_name: data.student_name,
                      ws_uuid: data.ws_uuid}})

    } catch (error) {
        console.error("Error joining session:", error);
    }
}

    return (
        
        <div>
            <form onSubmit={handleSubmit}>
            <h2>Join a session</h2>
            <input
                type="text"
                required
                value={code}
                onChange={handleChange}
                />
            <button type="submit">Join</button>
            </form>
        </div>


      );
}
 
export default Join;