import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Alert,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { groupApi, classApi, userApi } from '../services/api';
import { Group, Class, User } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [newGroup, setNewGroup] = useState({
    name: '',
    classId: '',
    coordinatorId: '',
    members: [] as string[],
    projectTheme: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'professor') {
          const classesData = await classApi.getByProfessor(user.id);
          setClasses(classesData);
          
          if (classesData.length > 0) {
            const groupsData = await Promise.all(
              classesData.map(c => groupApi.getByClass(c.id))
            );
            setGroups(groupsData.flat());
          }
        } else {
          const classesData = await classApi.getByStudent(user!.id);
          setClasses(classesData);
          const groupsData = await groupApi.getByMember(user!.id);
          setGroups(groupsData);
        }
        
        const usersData = await userApi.getAll();
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCreateGroup = async () => {
    try {
      const groupData = {
        ...newGroup,
        createdAt: new Date().toISOString()
      };
      
      const createdGroup = await groupApi.create(groupData);
      setGroups([...groups, createdGroup]);
      setOpen(false);
      setNewGroup({
        name: '',
        classId: '',
        coordinatorId: '',
        members: [],
        projectTheme: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    
    try {
      const updatedGroup = await groupApi.update(editingGroup.id, newGroup);
      setGroups(groups.map(g => g.id === editingGroup.id ? updatedGroup : g));
      setEditingGroup(null);
      setOpen(false);
      setNewGroup({
        name: '',
        classId: '',
        coordinatorId: '',
        members: [],
        projectTheme: ''
      });
    } catch (error) {
      console.error('Erreur lors de la modification du groupe:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await groupApi.delete(groupId);
        setGroups(groups.filter(g => g.id !== groupId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    setNewGroup({
      name: '',
      classId: '',
      coordinatorId: '',
      members: [],
      projectTheme: ''
    });
    setOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      classId: group.classId,
      coordinatorId: group.coordinatorId,
      members: group.members,
      projectTheme: group.projectTheme || ''
    });
    setOpen(true);
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Utilisateur inconnu';
  };

  const getClassName = (classId: string) => {
    const foundClass = classes.find(c => c.id === classId);
    return foundClass ? foundClass.name : 'Classe inconnue';
  };

  const getStudentsForClass = (classId: string) => {
    const foundClass = classes.find(c => c.id === classId);
    if (!foundClass) return [];
    return users.filter(u => foundClass.students.includes(u.id));
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {user?.role === 'professor' ? 'Gestion des Groupes' : 'Mon Groupe'}
        </Typography>
        {user?.role === 'professor' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Créer un Groupe
          </Button>
        )}
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label={user?.role === 'professor' ? 'Tous les Groupes' : 'Mon Groupe'} />
        {user?.role === 'professor' && <Tab label="Statistiques" />}
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} md={6} lg={4} key={group.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {group.name}
                    </Typography>
                    {user?.role === 'professor' && (
                      <Box>
                        <IconButton size="small" onClick={() => openEditDialog(group)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteGroup(group.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Classe: {getClassName(group.classId)}
                  </Typography>

                  {group.projectTheme && (
                    <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                      Thème: {group.projectTheme}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Coordinateur:
                    </Typography>
                    <Chip
                      avatar={<Avatar><StarIcon /></Avatar>}
                      label={getUserName(group.coordinatorId)}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Membres ({group.members.length}):
                  </Typography>
                  <List dense>
                    {group.members.map((memberId) => (
                      <ListItem key={memberId} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={getUserName(memberId)}
                          secondary={memberId === group.coordinatorId ? 'Coordinateur' : 'Membre'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {groups.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <GroupsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {user?.role === 'professor' 
                ? 'Aucun groupe créé' 
                : 'Vous n\'êtes membre d\'aucun groupe'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role === 'professor' 
                ? 'Créez votre premier groupe pour organiser les étudiants en équipes de projet.'
                : 'Votre professeur n\'a pas encore créé de groupes ou ne vous a pas encore assigné à un groupe.'}
            </Typography>
          </Paper>
        )}
      </TabPanel>

      {user?.role === 'professor' && (
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Groupes
                  </Typography>
                  <Typography variant="h4">
                    {groups.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Étudiants en Groupe
                  </Typography>
                  <Typography variant="h4">
                    {groups.reduce((total, group) => total + group.members.length, 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Groupes avec Thème
                  </Typography>
                  <Typography variant="h4">
                    {groups.filter(g => g.projectTheme).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      )}

      {/* Dialog pour créer/modifier un groupe */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGroup ? 'Modifier le Groupe' : 'Créer un Nouveau Groupe'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du groupe"
            fullWidth
            variant="outlined"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Classe</InputLabel>
            <Select
              value={newGroup.classId}
              onChange={(e) => setNewGroup({ ...newGroup, classId: e.target.value })}
            >
              {classes.map((classItem) => (
                <MenuItem key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {newGroup.classId && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Coordinateur</InputLabel>
              <Select
                value={newGroup.coordinatorId}
                onChange={(e) => setNewGroup({ ...newGroup, coordinatorId: e.target.value })}
              >
                {getStudentsForClass(newGroup.classId).map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {newGroup.classId && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Membres du groupe</InputLabel>
              <Select
                multiple
                value={newGroup.members}
                onChange={(e) => setNewGroup({ ...newGroup, members: e.target.value as string[] })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={getUserName(value)} />
                    ))}
                  </Box>
                )}
              >
                {getStudentsForClass(newGroup.classId).map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            margin="dense"
            label="Thème du projet"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGroup.projectTheme}
            onChange={(e) => setNewGroup({ ...newGroup, projectTheme: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
            variant="contained"
            disabled={!newGroup.name || !newGroup.classId || !newGroup.coordinatorId}
          >
            {editingGroup ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Groups;