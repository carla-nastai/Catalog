require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.post('/api/save-table-state', async (req, res) => {
  const { email, tableState } = req.body;

  if (!email || !tableState) {
    return res.status(400).json({ error: 'Email and table state are required' });
  }

  try {
    const query = `
      INSERT INTO catalogs (user_email, catalog)
      VALUES ($1, $2)
      ON CONFLICT (user_email) DO UPDATE SET catalog = EXCLUDED.catalog;
    `;
    await pool.query(query, [email, JSON.stringify(tableState)]);  // Folosește "user_email" și "catalog"
    res.status(200).json({ message: 'Table state saved successfully' });
  } catch (error) {
    console.error('Error saving table state:', error);
    res.status(500).json({ error: 'Failed to save table state', details: error.message });
  }
});

app.get('/api/load-table-state', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const query = 'SELECT catalog FROM catalogs WHERE user_email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
      const catalogData = result.rows[0].catalog;

      // Dacă catalogData este un string, îl parsăm înapoi într-un obiect
      if (typeof catalogData === 'string') {
        return res.status(200).json(JSON.parse(catalogData));
      } else {
        return res.status(200).json(catalogData); // Returnează catalogul direct
      }
    } else {
      // Returnăm tabela implicită dacă nu există date pentru acel email
      const defaultTable = [
        {
          materie: "Matematica",
          note: "7,8,9,7",
          extra: "-",
          absente: "18.10",
          medie: "-",
        },
      ];
      return res.status(200).json(defaultTable);
    }
  } catch (error) {
    console.error('Error loading table state:', error.message);
    res.status(500).json({ error: 'Failed to load table state', details: error.message });
  }
});


app.get("/api/get-student-status", async (req, res) => {
  const { email } = req.query;  // Preia email-ul din query string

  try {
    const result = await pool.query("SELECT is_student FROM accounts WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      return res.json({ is_student: result.rows[0].is_student });
    } else {
      return res.status(404).json({ error: "Email not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Endpoint pentru a obține email-urile din tabela accounts
app.get("/api/accounts", async (req, res) => {
  try {
    // Modificăm interogarea pentru a selecta doar conturile unde is_student = true
    const result = await pool.query("SELECT email FROM accounts WHERE is_student = true");

    res.json(result.rows); // Returnează lista de email-uri
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


// API to authenticate admin
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT * FROM accounts WHERE username = $1 AND password = $2';
    const result = await pool.query(query, [username, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.status(200).json({ 
        message: 'Login successful', 
        email: user.email
      });
      console.log(user.email)
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/signin', async (req, res) => {
  const { username, password, email, isStudent } = req.body;

  console.log('Received isStudent:', isStudent); // Verificăm valoarea trimisă din frontend

  try {
    const checkQuery = 'SELECT * FROM accounts WHERE username = $1 OR email = $2';
    const checkResult = await pool.query(checkQuery, [username, email]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const insertQuery = 'INSERT INTO accounts (username, password, email, is_student) VALUES ($1, $2, $3, $4)';
    await pool.query(insertQuery, [username, password, email, isStudent]); // Includem și isStudent

    res.status(201).json({ message: 'Account created successfully' });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Rute pentru a obține mesajele pentru un utilizator
// Rute pentru a obține mesajele pentru un utilizator
app.get('/api/messages', async (req, res) => {
  const receiverEmail = req.query.receiver_email;

  try {
    // Interogăm baza de date pentru a obține mesajele pentru un anumit receiver_email
    const query = 'SELECT * FROM messages WHERE receiver_email = $1 ORDER BY id DESC';
    const result = await pool.query(query, [receiverEmail]);

    // Returnăm mesajele găsite
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Endpoint pentru trimiterea unui mesaj
app.post('/api/messages', async (req, res) => {
  const { sender_name, sender_email, receiver_email, message_content } = req.body;

  if (!sender_name || !sender_email || !receiver_email || !message_content) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const insertQuery = 'INSERT INTO messages (sender_name, sender_email, receiver_email, message_content) VALUES ($1, $2, $3, $4)';
    await pool.query(insertQuery, [sender_name, sender_email, receiver_email, message_content]);

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint pentru trimiterea unui răspuns
// Răspunde la un mesaj
app.post('/api/responses', async (req, res) => {
  const { sender_name, sender_email, receiver_email, message_content, original_message_id } = req.body;

  try {
    // Inserăm răspunsul în tabela messages
    const query = 'INSERT INTO messages (sender_name, sender_email, receiver_email, message_content) VALUES ($1, $2, $3, $4) RETURNING id';
    const result = await pool.query(query, [sender_name, sender_email, receiver_email, message_content]);

    // Obținem ID-ul răspunsului
    const responseId = result.rows[0].id;

    // Afișăm un mesaj de succes
    res.status(201).json({ message: 'Response sent successfully', responseId });
  } catch (error) {
    console.error('Error sending response:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint pentru a șterge un mesaj
app.delete('/api/messages/:id', async (req, res) => {
  const messageId = req.params.id;
  
  try {
    const deleteQuery = 'DELETE FROM messages WHERE id = $1';
    const result = await pool.query(deleteQuery, [messageId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint pentru salvarea stării tabelului
app.post('/api/table-state', async (req, res) => {
  const { user_email, table_state } = req.body;

  if (!user_email || !table_state) {
    return res.status(400).json({ error: 'Missing user_email or table_state' });
  }

  try {
    // Inserare sau actualizare în funcție de existența utilizatorului
    const query = `
      INSERT INTO timetable_states (user_email, table_state)
      VALUES ($1, $2)
      ON CONFLICT (user_email)
      DO UPDATE SET table_state = EXCLUDED.table_state;
    `;
    await pool.query(query, [user_email, table_state]);
    res.status(200).json({ message: 'Table state saved successfully' });
  } catch (error) {
    console.error('Error saving table state:', error);
    res.status(500).json({ error: 'Failed to save table state' });
  }
});

// Endpoint pentru încărcarea stării tabelului
app.get('/api/table-state', async (req, res) => {
  const { user_email } = req.query;

  if (!user_email) {
    return res.status(400).json({ error: 'Missing user_email' });
  }

  try {
    const query = 'SELECT table_state FROM timetable_states WHERE user_email = $1';
    const result = await pool.query(query, [user_email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No table state found for this user' });
    }

    res.status(200).json(result.rows[0].table_state);
  } catch (error) {
    console.error('Error loading table state:', error);
    res.status(500).json({ error: 'Failed to load table state' });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});