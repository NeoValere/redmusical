// app/admin/payments/page.tsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default function AdminPaymentsPage() {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Payments Overview
      </Typography>
      <Typography variant="body1">
        This section will display a list of all payments, including role, amount, status, and date.
      </Typography>
      {/* Placeholder for payments list, filters, etc. */}
    </Paper>
  );
}
