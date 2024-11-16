import React, { useState } from "react";
import './App.css';
import './Home.css';
const Home = () => {
  const [filter, setFilter] = useState("all");

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const tableData = [
    {
      materie: "Matematica",
      note: "7,8,9,7",
      extra: "-",
      absente: "18.10",
      medie: "-",
    },
    {
      materie: "Romana",
      note: "8,7,6,7",
      extra: "-",
      absente: "15.05",
      medie: "-",
    },
    {
        materie: "Fizica",
        note: "8,7,6,7",
        extra: "-",
        absente: "15.05",
        medie: "-",
      },
      {
        materie: "Chimie",
        note: "8,7,6,7",
        extra: "-",
        absente: "15.05",
        medie: "-",
      },
      {
        materie: "Informatica",
        note: "8,7,6,7",
        extra: "-",
        absente: "16.04",
        medie: "-",
      },
    // Add more data as needed
  ];

  const getFilteredData = () => {
    if (filter === "all") {
      return tableData;
    }

    switch (filter) {
      case "notesBonus":
        return tableData.map(({ materie, note, extra }) => ({
          materie,
          note,
          extra,
        }));
      case "absente":
        return tableData.map(({ materie, absente }) => ({ materie, absente }));
      case "notesBonusMedie":
        return tableData.map(({ materie, note, extra, medie }) => ({
          materie,
          note,
          extra,
          medie,
        }));
      default:
        return tableData;
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="content">
      {/* Sidebar with Buttons */}
      <div className="sidebar">
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
      </div>
      <div className="main">
        <div className="table-container">
          {" "}
          {/* Add table container */}
          <table>
            <thead>
              <tr>
                {Object.keys(filteredData[0]).map((key) => (
                  <th key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, cellIndex) => (
                    <td key={cellIndex}>{value}</td>
                  ))}
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
