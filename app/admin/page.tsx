"use client";

// app/admin/page.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function AdminDashboardPage() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the RedMusical Admin Panel. Use the sidebar to navigate through the different sections.
      </Typography>
    </Paper>
  );
}
