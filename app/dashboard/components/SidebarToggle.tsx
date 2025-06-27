'use client';

import { IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

interface SidebarToggleProps {
  handleDrawerToggle: () => void;
  isSidebarOpen: boolean;
  isMobile: boolean;
}

export default function SidebarToggle({
  handleDrawerToggle,
  isSidebarOpen,
  isMobile,
}: SidebarToggleProps) {
  const theme = useTheme();

  const arrowVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 },
  };

  if (isMobile) {
    return null; // The toggle is not shown on mobile in the original design
  }

  return (
    <IconButton
      color="inherit"
      aria-label="toggle drawer"
      edge="start"
      onClick={handleDrawerToggle}
      sx={{
        mr: 2,
        color: theme.palette.text.primary,
        display: 'inline-flex',
        position: 'fixed',
        top: '35px',
        left: isSidebarOpen ? '245px' : '29px',
        zIndex: theme.zIndex.drawer + 2,
        transition: 'left 0.2s ease-in-out',
      }}
    >
      <motion.div
        animate={isSidebarOpen ? 'open' : 'closed'}
        variants={arrowVariants}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ArrowBackIosNewIcon />
      </motion.div>
    </IconButton>
  );
}
