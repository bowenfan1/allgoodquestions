import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import QuestionCard from "./QuestionCard";
import { getWebSocketConnection } from "./Websocket";

const Questions = () => {
    const location = useLocation();
    const code = location.state.code;
    const session_id = location.state.session_id;
    const navigate = useNavigate();
    const ws = getWebSocketConnection();
    const [receivedMessage, setReceivedMessage] = useState([]);

    useEffect(() => {
        // Set up the event listener for messages once, when the component mounts
        ws.onmessage = (event) => {
            // This function will be called whenever a message is received from the server
            const messageData = JSON.parse(event.data);
            // Do something with the received messageData, e.g., update the state, display the questions, etc.
            setReceivedMessage(messageData); // Update the receivedMessage state with the received data
        };

        // Clean up the event listener when the component unmounts
        return () => {
            ws.onmessage = null; // Remove the event listener to avoid memory leaks
        };
    }, [ws]);

const handleAnswer = (question) => {
    const message = {
        question_id: question.question_id,
        status: 'answered',
        session_id: session_id
      };
    console.log("hello");
    ws.send(JSON.stringify(message));

}

const handleSkip = () => {

}

const handleReject = () => {

}


const handleClick = async (e)  => {
    e.preventDefault();
    try {
        const response = await fetch('/session', {
            method: 'DELETE',
            headers:  {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: session_id
            })
        });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
    }
    const data = await response.json();
    //ws.close();
    navigate(`/end/${data.session_id}`, { state: {session_id: data.session_id}});
    } catch (error) {
        console.error("Error deleting session:", error);
    }
};

    return (

        <div className="questions">
            <h2>Your session code</h2>
            <p>Code: {code}</p>
            <br></br>
            <button onClick={handleClick}>End Session</button>
            {receivedMessage
            .filter(question => question.status === 'pending' || question.status === 'skipped')
            .map((question, index) => (
            <QuestionCard
            key={index}
            question={question}
            onAnswer={() => handleAnswer(question)} // Define handleAnswer function to handle the "Answered" button click
            onSkip={() => handleSkip(question)} // Define handleSkip function to handle the "Skip" button click
            onReject={() => handleReject(question)} // Define handleReject function to handle the "Reject" button click
            />
            ))}
        </div>
      );
}
 
export default Questions;