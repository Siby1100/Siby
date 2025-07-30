import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Class,
  Group,
  Assignment,
  People,
  TrendingUp,
  Notifications,
  School,
  Code,
  SupervisorAccount,
  Person,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';
import { classAPI } from '../../services/api';

const Dashboard = () => {
  const { user, isProfessor, isStudent } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [joinClassOpen, setJoinClassOpen] = useState(false);

  const {
    register: registerClass,
    handleSubmit: handleCreateClass,
    reset: resetClass,
    formState: { errors: classErrors },
  } = useForm();

  const {
    register: registerJoin,
    handleSubmit: handleJoinClass,
    reset: resetJoin,
    formState: { errors: joinErrors },
  } = useForm();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getUserClasses();
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  const onCreateClass = async (data) => {
    try {
      const response = await classAPI.createClass(data);
      toast.success('Classe créée avec succès !');
      setCreateClassOpen(false);
      resetClass();
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la classe');
    }
  };

  const onJoinClass = async (data) => {
    try {
      const response = await classAPI.joinClassByCode(data.classCode);
      toast.success('Vous avez rejoint la classe avec succès !');
      setJoinClassOpen(false);
      resetJoin();
      fetchClasses();
    } catch (error) {
      console.error('Error joining class:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription à la classe');
    }
  };

  const stats = [
    {
      title: 'Classes',
      value: classes.length,
      icon: <Class sx={{ fontSize: 40 }} />,
      color: 'primary.main',
      description: isProfessor ? 'Classes enseignées' : 'Classes suivies',
    },
    {
      title: 'Groupes',
      value: classes.reduce((acc, cls) => acc + (cls.group_count || 0), 0),
      icon: <Group sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
      description: isProfessor ? 'Groupes créés' : 'Groupes rejoints',
    },
    {
      title: 'Étudiants',
      value: classes.reduce((acc, cls) => acc + (cls.student_count || 0), 0),
      icon: <People sx={{ fontSize: 40 }} />,
      color: 'success.main',
      description: isProfessor ? 'Total étudiants' : 'Camarades de classe',
    },
    {
      title: 'Projets',
      value: classes.reduce((acc, cls) => acc + (cls.assignmentCount || 0), 0),
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      description: isProfessor ? 'Projets assignés' : 'Projets à réaliser',
    },
  ];

  const recentActivities = [
    {
      icon: <Class color="primary" />,
      title: 'Nouvelle classe créée',
      description: 'Développement Web Avancé - GL3',
      time: 'Il y a 2 heures',
    },
    {
      icon: <Group color="secondary" />,
      title: 'Nouveau groupe formé',
      description: 'Groupe Alpha - Projet Tutoré',
      time: 'Il y a 4 heures',
    },
    {
      icon: <Assignment color="warning" />,
      title: 'Soumission reçue',
      description: 'Chapitre 1 - Analyse des besoins',
      time: 'Il y a 6 heures',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Bienvenue, {user?.first_name} ! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isProfessor 
            ? 'Gérez vos classes et suivez les progressions de vos étudiants'
            : 'Consultez vos classes et collaborez avec vos groupes'
          }
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}, ${stat.color}22)`,
                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="white">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="white" sx={{ opacity: 0.7 }}>
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Classes Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  {isProfessor ? 'Mes Classes' : 'Classes Suivies'}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => isProfessor ? setCreateClassOpen(true) : setJoinClassOpen(true)}
                  startIcon={<Add />}
                >
                  {isProfessor ? 'Créer une classe' : 'Rejoindre une classe'}
                </Button>
              </Box>

              {classes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {isProfessor ? 'Aucune classe créée' : 'Aucune classe rejointe'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {isProfessor 
                      ? 'Commencez par créer votre première classe'
                      : 'Utilisez le code de classe fourni par votre professeur'
                    }
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => isProfessor ? setCreateClassOpen(true) : setJoinClassOpen(true)}
                    startIcon={<Add />}
                  >
                    {isProfessor ? 'Créer une classe' : 'Rejoindre une classe'}
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {classes.map((cls) => (
                    <Grid item xs={12} sm={6} key={cls.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          '&:hover': { boxShadow: 3, cursor: 'pointer' },
                          transition: 'box-shadow 0.3s',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight="600" noWrap>
                              {cls.name}
                            </Typography>
                            <Chip
                              label={cls.class_code}
                              size="small"
                              variant="outlined"
                              icon={<Code />}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {cls.academic_year} - Semestre {cls.semester}
                          </Typography>
                          {isProfessor && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              👥 {cls.student_count} étudiants • 🏷️ {cls.group_count} groupes
                            </Typography>
                          )}
                          {isStudent && cls.user_group_name && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Chip
                                label={cls.user_group_name}
                                size="small"
                                color={cls.is_coordinator ? 'primary' : 'secondary'}
                                icon={cls.is_coordinator ? <SupervisorAccount /> : <Person />}
                              />
                              {cls.is_coordinator && (
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                  Coordinateur
                                </Typography>
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Activité Récente
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'background.paper' }}>
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Class Dialog */}
      <Dialog open={createClassOpen} onClose={() => setCreateClassOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une nouvelle classe</DialogTitle>
        <form onSubmit={handleCreateClass(onCreateClass)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nom de la classe"
              margin="normal"
              {...registerClass('name', {
                required: 'Nom de la classe requis',
                minLength: { value: 3, message: 'Le nom doit contenir au moins 3 caractères' },
              })}
              error={!!classErrors.name}
              helperText={classErrors.name?.message}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              margin="normal"
              {...registerClass('description')}
            />
            <TextField
              fullWidth
              label="Année académique (ex: 2023-2024)"
              margin="normal"
              {...registerClass('academicYear', {
                required: 'Année académique requise',
                pattern: { value: /^\d{4}-\d{4}$/, message: 'Format: YYYY-YYYY' },
              })}
              error={!!classErrors.academicYear}
              helperText={classErrors.academicYear?.message}
            />
            <FormControl fullWidth margin="normal" error={!!classErrors.semester}>
              <InputLabel>Semestre</InputLabel>
              <Select
                label="Semestre"
                {...registerClass('semester', { required: 'Semestre requis' })}
                defaultValue=""
              >
                <MenuItem value="1">Semestre 1</MenuItem>
                <MenuItem value="2">Semestre 2</MenuItem>
              </Select>
              {classErrors.semester && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {classErrors.semester.message}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateClassOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained">Créer</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Join Class Dialog */}
      <Dialog open={joinClassOpen} onClose={() => setJoinClassOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rejoindre une classe</DialogTitle>
        <form onSubmit={handleJoinClass(onJoinClass)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Code de la classe"
              margin="normal"
              placeholder="Entrez le code fourni par votre professeur"
              {...registerJoin('classCode', {
                required: 'Code de classe requis',
                minLength: { value: 6, message: 'Code invalide' },
              })}
              error={!!joinErrors.classCode}
              helperText={joinErrors.classCode?.message}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJoinClassOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained">Rejoindre</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Dashboard;