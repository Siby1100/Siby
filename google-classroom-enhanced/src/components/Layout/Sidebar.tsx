import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as ClassIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon,
  Timeline as ProgressIcon,
  Message as MessageIcon,
  Announcement as AnnouncementIcon,
  CloudDownload as DocumentIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const DRAWER_WIDTH = 280;

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const professorMenuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Mes Classes', icon: <ClassIcon />, path: '/classes' },
    { text: 'Créer une Classe', icon: <AddIcon />, path: '/classes/create' },
    { text: 'Groupes', icon: <GroupsIcon />, path: '/groups' },
    { text: 'Devoirs', icon: <AssignmentIcon />, path: '/assignments' },
    { text: 'Progression', icon: <ProgressIcon />, path: '/progress' },
    { text: 'Messages', icon: <MessageIcon />, path: '/messages' },
    { text: 'Annonces', icon: <AnnouncementIcon />, path: '/announcements' },
    { text: 'Documents', icon: <DocumentIcon />, path: '/documents' }
  ];

  const studentMenuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Mes Classes', icon: <ClassIcon />, path: '/classes' },
    { text: 'Rejoindre une Classe', icon: <PersonAddIcon />, path: '/classes/join' },
    { text: 'Mon Groupe', icon: <GroupsIcon />, path: '/my-group' },
    { text: 'Devoirs', icon: <AssignmentIcon />, path: '/assignments' },
    { text: 'Progression', icon: <ProgressIcon />, path: '/progress' },
    { text: 'Messages', icon: <MessageIcon />, path: '/messages' },
    { text: 'Documents', icon: <DocumentIcon />, path: '/documents' }
  ];

  const menuItems = user?.role === 'professor' ? professorMenuItems : studentMenuItems;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const drawer = (
    <Box>
      <Toolbar />
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          {user?.name}
        </Typography>
        <Chip 
          label={user?.role === 'professor' ? 'Professeur' : 'Étudiant'} 
          color={user?.role === 'professor' ? 'primary' : 'secondary'}
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="text.secondary" align="center">
          Google Classroom Enhanced v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;