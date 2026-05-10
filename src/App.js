import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Layout from './components/Layout';
import Home from './pages/Home';
import MockInterview from './pages/MockInterview';
import Quiz from './pages/Quiz';
import Calendar from './pages/Calendar';
import Networking from './pages/Networking';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="interview" element={<MockInterview />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="networking" element={<Networking />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
