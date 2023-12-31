import Navbar from './Navbar';
import Home from './Home';
import { BrowserRouter as Router , Route, Routes } from 'react-router-dom';
import Create from './Create';
import Join from './Join';
import Questions from './Questions';
import Ask from './Ask';
//import QuestionCard from './QuestionCard';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route exact path="/" element= {<Home />}>
            </Route>
            <Route path="/create" element= {<Create />}>
            </Route>
            <Route path="/join" element= {<Join />}>
            </Route>
            <Route path="/questions/:uuid" element= {<Questions />}>
            </Route>
            <Route path="/ask/:uuid" element= {<Ask />}>
            </Route>
            {/*<Route path="/end/:uuid" element= {<End />}> 
            </Route>*/}
            </Routes>
        </div>
      </div>
    </Router>
    );
}

export default App;
