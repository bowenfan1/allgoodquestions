import { useState } from "react";
import { useNavigate } from "react-router-dom";
//import { setWebSocketConnection } from "./Websocket";

const Create = () => {
    const [title, setTitle] = useState('');
    const navigate = useNavigate();

const handleTitleChange = (e) => {
    setTitle(e.target.value);
};

    
const handleSubmit = async (e) => {
    e.preventDefault();


    try {
        const response = await fetch('/session', {
            method: 'POST',
            headers:  {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_title: title
            })
        });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
    }
    const data = await response.json();
    //const ws = new WebSocket(`ws://localhost:3002/${data.session_id}`);
    //setWebSocketConnection(ws);
    navigate(`/questions/${data.session_id}`, { state: {session_id: data.session_id, code: data.code}});
    } catch (error) {
        console.error("Error creating session:", error);
    }
};


{/*const isProfessor = true;
const sessionId = '12345';

// Construct the WebSocket URL with custom headers
const wsUrl = `ws://localhost:3002/${sessionId}`;
const ws = new WebSocket(wsUrl, [
  `isProfessor=${isProfessor}`,
]);*/}

    return (
        <div className="create">
            <h2>Create a Session</h2>
            <form onSubmit={handleSubmit}>
                <label>Session Title:</label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                />
                <button type="submit">Create</button>
                <p>{title}</p>
            </form>
        </div>
    );
}
 
export default Create;