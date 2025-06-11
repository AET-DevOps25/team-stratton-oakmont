//import React, { useState } from "react";
import "./App.css";
import Login from './components/Login';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>TUM Study Planner</h1>
        <p>Frontend is running successfully! 🎉</p>
      </header>
      <main>
        <Login />
      </main>
    </div>
  );
}

export default App;
