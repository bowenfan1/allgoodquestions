import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setWebSocketConnection, getWebSocketConnection, getWebSocketUUID } from "./Websocket";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const Ask = () => {
    const [question, setQuestion] = useState('');
    const location = useLocation()
    const student_name = location.state.student_name;
    const session_title = location.state.session_title;
    const session_id = location.state.session_id;
    const ws_uuid = getWebSocketUUID();
    const ws = getWebSocketConnection()

    useEffect(() => {
        // Set up the event listener for messages once, when the component mounts
        ws.onmessage = (event) => {
            // This function will be called whenever a message is received from the server
            const messageData = JSON.parse(event.data);
            // Do something with the received messageData, e.g., update the state, display the questions, etc.
        };

        // Clean up the event listener when the component unmounts
        return () => {
            ws.onmessage = null; // Remove the event listener to avoid memory leaks
        };
    }, [ws]);

const handleChange = (e) => {
        setQuestion(e.target.value);
    }
    
const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
        question: question,
        student_name: student_name,
        session_id: session_id
      };
    ws.send(JSON.stringify(message));
}
    return (
        <div>
            <form onSubmit={handleSubmit}>
            <h2>{student_name} has joined {session_title}</h2>
            <h3>ws_uuid = {ws_uuid}</h3>
            <input type="text" onChange={handleChange} />
            <button>Ask</button>
            </form>
        </div>
      );
}
 
export default Ask;