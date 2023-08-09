const QuestionCard = ({ question, onAnswer, onSkip, onReject }) => {
    const { question_id, content, status, student_name } = question;
    return (
        <div className="questioncard">
        <p>Question_ID: {question_id}</p>
        <p>Content: {content}</p>
        <p>Student Name: {student_name}</p>
        <button id="answer" onClick={onAnswer}>Answer</button>
        <button id="skip" onClick={onSkip}>Skip</button>
        <button id="reject" onClick={onReject}>Reject</button>
        </div>





      );
}
 
export default QuestionCard;