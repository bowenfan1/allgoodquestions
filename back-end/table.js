const sqlite = require('sqlite3').verbose();
const session_db = new sqlite.Database('./session.db', sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.error(err);
});

const question_db = new sqlite.Database('./question.db', sqlite.OPEN_READWRITE, (err)=>{
    if (err) return console.error(err);
});

const session_db_sql = 'CREATE TABLE session(ID INTEGER PRIMARY KEY, code, created_at, session_title)'; //3 fields
const question_db_sql = 'CREATE TABLE question(ID INTEGER PRIMARY KEY, session_id, submitted_at, student_name, content, status, FOREIGN KEY (session_id) REFERENCES session(ID))'; //3 fields

//const session_db_sql = 'DROP TABLE session'; //3 fields
//const question_db_sql = 'DROP TABLE question'; //3 fields


session_db.run(session_db_sql);
question_db.run(question_db_sql);
