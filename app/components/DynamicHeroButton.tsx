"use client";

import Link from 'next/link';
import { Button, Menu, MenuItem, useTheme } from '@mui/material';
import { SignIn, UserCircle, List as ListIcon, User as UserIcon, Buildings } from 'phosphor-react'; // Aliased User as UserIcon
import { useState } from 'react';
import { User } from '@supabase/supabase-js';

interface DynamicHeroButtonProps {
  currentUser: User | null; // Supabase user object
  userRoles: {
    isMusician: boolean;
    isContractor: boolean;
    userId: string | null;
  };
}

const DynamicHeroButton: React.FC<DynamicHeroButtonProps> = ({ currentUser, userRoles }) => {
  const theme = useTheme(); // Get the theme object
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!currentUser || !userRoles.userId) {
    return (
      <Button
        component={Link}
        href="/login"
        variant="contained"
        color="primary"
        size="large"
        startIcon={<SignIn size={22} />}
        sx={{
          fontWeight: 'bold',
          py: 1.5,
          px: 4,
          fontSize: '1.1rem',
          boxShadow: `0 4px 20px ${theme.palette.primary.main}33`
        }}
      >
        Ingresar o Registrarse
      </Button>
    );
  }

  const { isMusician, isContractor, userId } = userRoles;

  if (isMusician && isContractor) {
    return (
      <>
        <Button
          id="panel-button"
          aria-controls={open ? 'panel-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          variant="contained"
          color="primary"
          size="large"
          onClick={handleClick}
          startIcon={<UserCircle size={22} />}
          endIcon={<ListIcon size={18} />} // Icon to indicate dropdown
          sx={{
            fontWeight: 'bold',
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            boxShadow: `0 4px 20px ${theme.palette.primary.main}33`
          }}
        >
          Ir a mis Paneles
        </Button>
        <Menu
          id="panel-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'panel-button',
          }}
          PaperProps={{
            style: {
              marginTop: theme.spacing(1),
              boxShadow: theme.shadows[3],
            }
          }}
        >
          <MenuItem
            component={Link}
            href={`/dashboard`}
            onClick={handleClose}
            sx={{ paddingY: 1.5, paddingX: 2.5 }}
          >
            <UserIcon size={20} style={{ marginRight: theme.spacing(1.5), color: theme.palette.primary.main }} />
            Panel de Músico
          </MenuItem>
          <MenuItem
            component={Link}
            href="/dashboard/search"
            onClick={handleClose}
            sx={{ paddingY: 1.5, paddingX: 2.5 }}
          >
            <Buildings size={20} style={{ marginRight: theme.spacing(1.5), color: theme.palette.primary.main }} />
            Panel de Búsqueda
          </MenuItem>
        </Menu>
      </>
    );
  }

  if (isMusician) {
    return (
      <Button
        component={Link}
        href={`/m/${userId}`}
        variant="contained"
        color="primary"
        size="large"
        startIcon={<UserCircle size={22} />}
        sx={{
          fontWeight: 'bold',
          py: 1.5,
          px: 4,
          fontSize: '1.1rem',
          boxShadow: `0 4px 20px ${theme.palette.primary.main}33`
        }}
      >
        Ir a mi Panel de Músico
      </Button>
    );
  }

  if (isContractor) {
    return (
      <Button
        component={Link}
        href="/dashboard"
        variant="contained"
        color="primary"
        size="large"
        startIcon={<UserCircle size={22} />}
        sx={{
          fontWeight: 'bold',
          py: 1.5,
          px: 4,
          fontSize: '1.1rem',
          boxShadow: `0 4px 20px ${theme.palette.primary.main}33`
        }}
      >
        Ir a mi Panel de Búsqueda
      </Button>
    );
  }

  // Fallback if user is logged in but has no specific role (should ideally go to select-role or similar)
  // For now, linking to login as a safe default, though this case should be handled by select-role page.
  return (
    <Button
      component={Link}
      href="/select-role" 
      variant="contained"
      color="primary"
      size="large"
      startIcon={<UserCircle size={22} />}
      sx={{
        fontWeight: 'bold',
        py: 1.5,
        px: 4,
        fontSize: '1.1rem',
        boxShadow: `0 4px 20px ${theme.palette.primary.main}33`
      }}
    >
      Seleccionar Rol
    </Button>
  );
};

export default DynamicHeroButton;
