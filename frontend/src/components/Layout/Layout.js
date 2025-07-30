import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  Class,
  Group,
  Assignment,
  Message,
  Settings,
  Logout,
  School,
  SupervisorAccount,
  Person,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, isProfessor, isStudent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const menuItems = [
    {
      text: 'Tableau de bord',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['professor', 'student'],
    },
    {
      text: 'Mes Classes',
      icon: <Class />,
      path: '/classes',
      roles: ['professor', 'student'],
    },
    {
      text: 'Mes Groupes',
      icon: <Group />,
      path: '/groups',
      roles: ['student'],
    },
    {
      text: 'Devoirs',
      icon: <Assignment />,
      path: '/assignments',
      roles: ['professor', 'student'],
    },
    {
      text: 'Messages',
      icon: <Message />,
      path: '/messages',
      roles: ['professor', 'student'],
    },
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <School sx={{ fontSize: 32, mr: 2 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Enhanced Classroom
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Plateforme Collaborative
          </Typography>
        </Box>
      </Box>

      {/* User info */}
      <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
            {isProfessor ? <SupervisorAccount /> : <Person />}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="600">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={isProfessor ? 'Professeur' : 'Étudiant'}
                size="small"
                color={isProfessor ? 'primary' : 'secondary'}
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ pt: 0 }}>
        {menuItems
          .filter(item => item.roles.includes(user?.role))
          .map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                bgcolor: location.pathname === item.path ? 'action.selected' : 'transparent',
                borderRight: location.pathname === item.path ? `3px solid ${theme.palette.primary.main}` : 'none',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  },
                }}
              />
            </ListItem>
          ))}
      </List>

      <Divider sx={{ mt: 'auto' }} />

      <List>
        <ListItem
          button
          onClick={() => {
            navigate('/profile');
            if (isMobile) setMobileOpen(false);
          }}
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Paramètres" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/dashboard' && 'Tableau de bord'}
            {location.pathname === '/profile' && 'Profil'}
            {location.pathname.startsWith('/classes') && 'Classes'}
            {location.pathname.startsWith('/groups') && 'Groupes'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton size="large" onClick={handleMenu} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.first_name?.[0]}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              <AccountCircle sx={{ mr: 2 }} />
              Profil
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;