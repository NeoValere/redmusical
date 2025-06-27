import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const admin = await prisma.admin.findUnique({
    where: { userId: session.user.id },
  });

  if (!admin) {
    redirect('/');
  }

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
