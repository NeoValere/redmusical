'use client';

import { Box, Typography, IconButton, AppBar, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Import useTheme
import { useDashboard } from '../context/DashboardContext';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { usePathname } from 'next/navigation';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon'; // Added import
import { useState } from 'react'; // Needed for Menu state
import { SignOut, MagnifyingGlass, MusicNote } from 'phosphor-react'; // Removed Headphones, PlusCircle, UserCircle
import Link from 'next/link';

interface HeaderProps {
  handleDrawerToggle: () => void; // For desktop sidebar, and potentially mobile menu if different icon
  isMobile: boolean;
  isSidebarOpen: boolean;
  handleLogout: () => void;
  userRole: string | null;
  hasContractorProfile: boolean;
  handleSwitchRole: () => Promise<void>;
  handleCreateContractorProfile: () => Promise<void>;
}

export default function Header({
  isMobile,
  handleLogout,
  userRole,
  hasContractorProfile,
  handleSwitchRole,
  handleCreateContractorProfile,
}: HeaderProps) {
  const theme = useTheme();
  const { pageTitle } = useDashboard();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const mobileMenuOpen = Boolean(anchorEl);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setAnchorEl(null);
  };

  // Hide the entire header on the musician search page, as the toggle is handled separately
  if (pathname === '/dashboard/musicos') {
    return null;
  }

  return (
    <AppBar
      position="static" // Or "sticky" if you want it to stick at the top on scroll
      elevation={0} // No shadow, flat design
      sx={{
        backgroundColor: 'transparent', // Make AppBar background transparent
        // backgroundColor: theme.palette.background.paper, // Or use paper color if preferred
        // borderBottom: `1px solid ${theme.palette.divider}`, // Optional: a subtle bottom border
        mb: 4, // Keep existing margin bottom
      }}
    >
      <Toolbar sx={{ paddingLeft: { xs: 1, sm: 2 }, paddingRight: { xs: 1, sm: 2 } }}>
        <Box sx={{ flexGrow: 1, ml: { xs: 0, md: '0px' } }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {pageTitle}
          </Typography>
        </Box>

        {/* Mobile Menu Icon and Dropdown */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              aria-label="open user menu"
              edge="end"
              onClick={handleMobileMenuOpen}
              sx={{ color: theme.palette.text.primary }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="mobile-user-menu"
              anchorEl={anchorEl}
              open={mobileMenuOpen}
              onClose={handleMobileMenuClose}
              MenuListProps={{
                'aria-labelledby': 'mobile-menu-button',
              }}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{ mt: '45px' }} // Adjust margin top as needed
            >
              <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                <MenuItem>
                  <ListItemIcon>
                    <MusicNote size={22} />
                  </ListItemIcon>
                  Volver al Home
                </MenuItem>
              </Link>
              {(userRole === 'musician' || userRole === 'both') && (
                hasContractorProfile ? (
                  <MenuItem onClick={() => { handleSwitchRole(); handleMobileMenuClose(); }}>
                    <ListItemIcon>
                      <MagnifyingGlass size={22} />
                    </ListItemIcon>
                    Ir a la búsqueda de músicos
                  </MenuItem>
                ) : (
                  <MenuItem onClick={() => { handleCreateContractorProfile(); handleMobileMenuClose(); }}>
                    <ListItemIcon>
                      <MagnifyingGlass size={22} />
                    </ListItemIcon>
                    Activar modo búsqueda
                  </MenuItem>
                )
              )}
              {/* Add other roles specific options if needed, e.g., switch to musician for contractors */}
              <MenuItem onClick={() => { handleLogout(); handleMobileMenuClose(); }}>
                <ListItemIcon>
                  <SignOut size={22} />
                </ListItemIcon>
                Cerrar sesión
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
