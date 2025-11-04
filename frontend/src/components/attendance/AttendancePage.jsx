import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AttendanceList from './AttendanceList';
import AttendanceForm from './AttendanceForm';

const AttendancePage = () => {
  return (
    <Routes>
      <Route path="/" element={<AttendanceList />} />
      <Route path="/new" element={<AttendanceForm />} />
      <Route path="/edit/:id" element={<AttendanceForm />} />
      <Route path="*" element={<Navigate to="/attendance" replace />} />
    </Routes>
  );
};

export default AttendancePage;