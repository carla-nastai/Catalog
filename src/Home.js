import React, { useState, useEffect } from "react";
import './App.css';
import './Home.css';

const Home = () => {
  const [filter, setFilter] = useState("all");
  const [tableData, setTableData] = useState([
    {
      materie: "Matematica",
      note: "7,8,9,7",
      extra: "-",
      absente: "18.10",
      medie: "-",
    },
    // Alte date ...
  ]);
  const [emails, setEmails] = useState([]);  // Lista de emailuri
  const [selectedEmail, setSelectedEmail] = useState("");  // Emailul selectat
  const [isStudent, setIsStudent] = useState(false);  // Determină dacă utilizatorul este student

  useEffect(() => {
    // Verificăm dacă există un email stocat în localStorage
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      setSelectedEmail(storedEmail);

      // Verificăm dacă emailul stocat are statusul isStudent=true
      fetch(`http://localhost:5000/api/get-student-status?email=${storedEmail}`)
        .then((response) => response.json())
        .then((data) => {
          setIsStudent(data.is_student);  // Setăm starea pentru is_student
        })
        .catch((error) => {
          console.error("Error fetching student status:", error);
          setIsStudent(false);  // Setează ca false în caz de eroare
        });
    }

    // Fetch emails from the server when the component is mounted
    fetch('http://localhost:5000/api/accounts')
      .then((response) => response.json())
      .then((data) => setEmails(data.map(item => item.email)))
      .catch((error) => console.error("Error fetching emails:", error));
  }, []);

  useEffect(() => {
    if (selectedEmail) {
      // Căutăm tabela pentru emailul selectat
      fetch(`http://localhost:5000/api/load-table-state?email=${selectedEmail}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Table loaded:', data);
          if (Array.isArray(data)) {
            setTableData(data);  // Setăm tabela găsită
          } else {
            setTableData([{
              materie: "Matematica",
              note: "7,8,9,7",
              extra: "-",
              absente: "18.10",
              medie: "-",
            }]);
          }
        })
        .catch((error) => {
          console.error('Error loading table:', error);
          setTableData([{
            materie: "Matematica",
            note: "7,8,9,7",
            extra: "-",
            absente: "18.10",
            medie: "-",
          }]);
        });
    } else {
      setTableData([{
        materie: "Matematica",
        note: "7,8,9,7",
        extra: "-",
        absente: "18.10",
        medie: "-",
      }]);
    }
  }, [selectedEmail]);

  const handleEmailChange = (event) => {
    const email = event.target.value;
    setSelectedEmail(email);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const getFilteredData = () => {
    let filteredData = [];
  
    const columnConfig = {
      all: ['materie', 'note', 'extra', 'absente', 'medie'],
      notesBonus: ['materie', 'note', 'extra'],
      absente: ['materie', 'absente'],
      notesBonusMedie: ['materie', 'note', 'extra', 'medie']
    };
  
    const relevantColumns = columnConfig[filter] || columnConfig.all;
  
    filteredData = tableData.map((row) => {
      const filteredRow = {};
      relevantColumns.forEach((column) => {
        filteredRow[column] = row[column] || "";
      });
      return filteredRow;
    });
  
    return filteredData;
  };

  const handleCellChange = (rowIndex, key, value) => {
    if (isStudent) return; // Nu permite modificarea dacă utilizatorul este student

    const updatedData = [...tableData];
    updatedData[rowIndex][key] = value;
    setTableData(updatedData);
  };

  const handleAddRow = () => {
    if (isStudent) return; // Nu permite adăugarea de rânduri dacă utilizatorul este student

    setTableData([
      ...tableData,
      {
        materie: "",
        note: "",
        extra: "-",
        absente: "",
        medie: "-",
      },
    ]);
  };

  const handleDeleteRow = (rowIndex) => {
    if (isStudent) return; // Nu permite ștergerea de rânduri dacă utilizatorul este student

    const updatedData = tableData.filter((_, index) => index !== rowIndex);
    setTableData(updatedData);
  };

  const handleSaveTable = () => {
    if (!selectedEmail || !tableData) {
      alert("Please select an email and ensure the table data is present.");
      return;
    }

    const tableState = tableData;  // Acesta este obiectul care trebuie trimis

    console.log('Saving table state:', { email: selectedEmail, tableState });

    fetch('http://localhost:5000/api/save-table-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: selectedEmail, tableState }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Table saved successfully:', data);
        alert('Table saved successfully!');
      })
      .catch((error) => {
        console.error('Error saving table:', error);
        alert('Error saving table.');
      });
  };

  const filteredData = getFilteredData();

  return (
    <div className="content">
      <div className="sidebar">
        {!isStudent && (
          <>
            <button className="button" onClick={() => handleFilterChange("all")}>
              Show All
            </button>
            <button
              className="button"
              onClick={() => handleFilterChange("notesBonus")}
            >
              Materie + Note + Bonus
            </button>
            <button
              className="button"
              onClick={() => handleFilterChange("absente")}
            >
              Materie + Absente
            </button>
            <button
              className="button"
              onClick={() => handleFilterChange("notesBonusMedie")}
            >
              Materie + Note + Bonus + Medie
            </button>
            <button className="button" onClick={handleAddRow}>
              Add Row
            </button>
            <button className="button" onClick={handleSaveTable}>
              Save Table
            </button>
          </>
        )}
        {isStudent && (
          <>
            <button className="button" onClick={() => handleFilterChange("all")}>
              Show All
            </button>
            <button
              className="button"
              onClick={() => handleFilterChange("notesBonus")}
            >
              Materie + Note + Bonus
            </button>
            <button
              className="button"
              onClick={() => handleFilterChange("absente")}
            >
              Materie + Absente
            </button>
            <button
              className="button"
              onClick={() => handleFilterChange("notesBonusMedie")}
            >
              Materie + Note + Bonus + Medie
            </button>
          </>
        )}
      </div>

      <div className="main">
        {!isStudent && (
          <div>
            <label htmlFor="emailSelect">Select Email: </label>
            <select
              id="emailSelect"
              value={selectedEmail}
              onChange={handleEmailChange}
            >
              <option value="">Select an email</option>
              {emails.map((email, index) => (
                <option key={index} value={email}>
                  {email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                {filteredData.length > 0 && Object.keys(filteredData[0]).map((key) => (
                  <th key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
                {!isStudent && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredData) && filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.entries(row).map(([key, value], cellIndex) => (
                    <td key={cellIndex}>
                      {isStudent ? (
                        <span>{value}</span> // Afișează doar textul pentru studenți
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            handleCellChange(rowIndex, key, e.target.value)
                          }
                        />
                      )}
                    </td>
                  ))}
                  {!isStudent && (
                    <td>
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        style={{ color: "red" }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
