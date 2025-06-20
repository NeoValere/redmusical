// app/admin/users/page.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function AdminUsersPage() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1">
        This section will display a list of all users (Musicians and Contractors) with filtering and management options.
      </Typography>
      {/* Placeholder for user list, filters, etc. */}
    </Paper>
  );
}
