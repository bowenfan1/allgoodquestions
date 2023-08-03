import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Join = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');

const handleSubmit = (e) => {
    navigate('/');
}

const handleChange = (e) => {
   setCode(e.target.value);
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