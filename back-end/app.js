const express = require("express");
const bodyParser = require("body-parser");
const { uniqueNamesGenerator, adjectives, colors, animals } = require("unique-names-generator");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 3002});



let sql;
const sqlite = require('sqlite3').verbose();
const url = require("url");

const session_db = new sqlite.Database('./session.db', sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.error(err);
});

const question_db = new sqlite.Database('./question.db', sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.error(err);
});


app.use(bodyParser.json());
app.use(cors());
const professorConnections = {};
const studentConnections = {};

//Set up web socket
wss.on('connection', (ws, req) => {
  const isProfessor = req.url.includes('isProfessor=true');
  if (isProfessor) {
    console.log('New professor Websocket connection');
    const session_id = new URLSearchParams(req.url).get('session_id');
    professorConnections[session_id] = ws;


    ws.on('close', () => {
      const index = connections.indexOf(ws);
      if (index !== -1) {
        // Remove the WebSocket object from the array using splice()
        connections.splice(index, 1);
        console.log('WebSocket connection closed. Total connections:', connections.length);
      }
    });
  } else {
    console.log('New student Websocket connection');

  }
  // Handle professor dashboard connections, e.g., store the WebSocket connection in an array or map
});



//Helper function to generate 4 letter session codes
function generate_code() {
    var code = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code
}


// Professor APIs:

// Create session with a title (Post)
app.post('/session', async (req, res) => {
  try {
    const session_id = uuidv4();
    const code = generate_code();
    const created_at = new Date().toLocaleString();
    const { session_title } = req.body;
    const sql = "INSERT INTO session(session_id, code, session_title, created_at) VALUES (?, ?, ?, ?)";

    await new Promise((resolve, reject) => {
      session_db.run(sql, [session_id, code, session_title, created_at], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('Session titled', session_title, 'created at', created_at, 'with session code', code);

    return res.json({
      status: 200,
      success: true,
      session_id: session_id,
      code: code
    });
  } catch (error) {
    return res.json({
      status: 400,
      success: false,
      error: error.message
    });
  }
});


// Mark question as "answered", "skipped", or "rejected" (Patch)
app.patch('/question', async (req, res) => {
  try {
    const { status, question_id } = req.body;
    const sql = "UPDATE question SET status = ? WHERE ID = ?";

    await new Promise((resolve, reject) => {
      question_db.run(sql, [status, question_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Question marked as', status);

    return res.json({
      status: 200,
      success: true
    });
  } catch (error) {
    return res.json({
      status: 400,
      success: false,
      error: error.message
    });
  }
});

// End session (Delete) need to delete session and all questions with session id
app.delete("/session", async (req, res) => {
  try {
    const { session_id } = req.body;
    const deleteSessionQuery = "DELETE FROM session WHERE session_id = ?";
    const deleteQuestionsQuery = "DELETE FROM question WHERE session_id = ?";

    await new Promise((resolve, reject) => {
      session_db.run(deleteSessionQuery, [session_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      question_db.run(deleteQuestionsQuery, [session_id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('The session has ended');
    console.log('The associated questions have been deleted');

    return res.json({
      status: 200,
      success: true,
      session_id: session_id
    });
  } catch (error) {
    return res.json({
      status: 400,
      success: false,
      error: error.message
    });
  }
});

// Student APIs:

// Join session and retrieve a unique username
app.get("/join", async (req, res) => {
    try {
      const queryObject = url.parse(req.url, true).query; // query parameters
      const student_name = uniqueNamesGenerator({ dictionaries: [colors, animals] }); // generate a unique name for student
      sql = `SELECT * FROM session WHERE code = '${queryObject.code}'`;
  
      const row = await new Promise((resolve, reject) => {
        session_db.get(sql, [], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
  
      if (!row) return res.json({ status: 300, success: false, error: "No match" });
  
      const session_id = row.session_id; // Extract the session ID value
      const session_title = row.session_title;

      console.log("Student", student_name, "has joined the session titled", row.session_title);
      return res.json({ status: 200, session_id: session_id, session_title: session_title, student_name: student_name, success: true });
    } catch (error) {
      return res.json({
        status: 400,
        success: false,
        error: error.message
      });
    }
  });
  

// Ask question (Post)
app.post('/ask', async (req, res) => {
    try {
      const submitted_at = new Date().toLocaleString();
      const { content, student_name, session_id} = req.body;
      const question_id = uuidv4();
      const sql = "INSERT INTO question(question_id, session_id, submitted_at, student_name, content, status) VALUES (?, ?,?,?,?,?)";
  

      await new Promise((resolve, reject) => {
        question_db.run(sql, [question_id, session_id, submitted_at, student_name, content, "pending"], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
  
      console.log('Question', content, 'submitted at', submitted_at, 'by', student_name);

      const getQuestionsSql = "SELECT content, student_name FROM question WHERE session_id = ?";
      const questions = await new Promise((resolve, reject) => {
        question_db.all(getQuestionsSql, [session_id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const ws = connections[session_id];
      ws.send(JSON.stringify(questions));

      return res.json({
        status: 200,
        success: true,
        question_id: question_id
      });
    } catch (error) {
      return res.json({
        status: 400,
        success: false,
        error: error.message
      });
    }
  });

// Edit question (Patch)
app.patch('/question/edit', (req, res)=> {
    try {
        const {content, student_name, question_id} = req.body;
        sql = "UPDATE question SET content = ? WHERE ID = ?";
        question_db.run(sql, [content, question_id], (err) => {
            if (err) return res.json({status:300, success:false, error:err});
            console.log('Question updated to', content, "by", student_name);
        });
        return res.json({
            status:200,
            success:true,
        });
    }
        catch (error) {
        return res.json({
            status:400,
            success:false,
            });
        }
    });


// Delete question (Delete)
app.delete("/question", (req, res)=> {
    try {
        const {question_id, student_name} = req.body;
        sql = "DELETE FROM question WHERE ID = ?";
        question_db.run(sql, [question_id], (err) => {
            if (err) return res.json({status:300, success:false, error:err});
            console.log('A question has been deleted by', student_name);
        });
        return res.json({
            status:200,
            success:true,
        });
    }
        catch (error) {
        return res.json({
            status:400,
            success:false,
            });
        }

});

//Retreive all questions in a session (Get)
app.get("/questions/:session_id", (req, res) => {
  try {
    const { session_id } = req.params;
    sql = "SELECT * FROM question WHERE session_id = ?";
    question_db.all(sql, [session_id], (err, rows) => {
      if (err) return res.json({ status: 300, success: false, error: err });
      console.log("Questions retrieved for session_id:", session_id);
      return res.json({
        status: 200,
        success: true,
        data: rows,
      });
    });
  } catch (error) {
    return res.json({
      status: 400,
      success: false,
      error: error.message,
    });
  }
});




app.listen(3000);

