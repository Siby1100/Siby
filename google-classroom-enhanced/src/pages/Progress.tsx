import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { projectProgressApi, groupApi, userApi } from '../services/api';
import { ProjectProgress, Group, User } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Progress: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProjectProgress[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [newStatus, setNewStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  const projectSteps = [
    'Soumission du thème',
    'Validation du thème',
    'Rédaction du chapitre 1',
    'Chapitre 1 OK',
    'Rédaction du chapitre 2',
    'Chapitre 2 OK',
    'Rédaction du chapitre 3',
    'Chapitre 3 OK',
    'Version provisoire',
    'Diapo de présentation',
    'Correction après soutenance',
    'Version finale'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'professor') {
          const allProgress = await projectProgressApi.getAll();
          setProgress(allProgress);
          const allGroups = await groupApi.getAll();
          setGroups(allGroups);
        } else {
          const userGroups = await groupApi.getByMember(user!.id);
          setGroups(userGroups);
          
          if (userGroups.length > 0) {
            const progressData = await Promise.all(
              userGroups.map(g => projectProgressApi.getByGroup(g.id))
            );
            setProgress(progressData.flat());
          }
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

  const getProgressPercentage = (steps: any[]) => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStepStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in_progress':
        return <PlayArrowIcon color="warning" />;
      default:
        return <ScheduleIcon color="disabled" />;
    }
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Utilisateur inconnu';
  };

  const getGroupName = (groupId: string) => {
    const foundGroup = groups.find(g => g.id === groupId);
    return foundGroup ? foundGroup.name : 'Groupe inconnu';
  };

  const handleUpdateStep = async () => {
    if (!selectedGroup || !selectedStep) return;

    try {
      await projectProgressApi.updateStep(selectedGroup, selectedStep, newStatus);
      
      // Actualiser les données
      if (user?.role === 'professor') {
        const allProgress = await projectProgressApi.getAll();
        setProgress(allProgress);
      } else {
        const userGroups = await groupApi.getByMember(user!.id);
        if (userGroups.length > 0) {
          const progressData = await Promise.all(
            userGroups.map(g => projectProgressApi.getByGroup(g.id))
          );
          setProgress(progressData.flat());
        }
      }
      
      setEditDialog(false);
      setSelectedGroup('');
      setSelectedStep('');
      setNewStatus('pending');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const openEditDialog = (groupId: string, stepName: string, currentStatus: string) => {
    setSelectedGroup(groupId);
    setSelectedStep(stepName);
    setNewStatus(currentStatus as 'pending' | 'in_progress' | 'completed');
    setEditDialog(true);
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Suivi de Progression des Projets
      </Typography>

      {/* Vue d'ensemble */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Groupes
                  </Typography>
                  <Typography variant="h5">
                    {groups.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Projets Terminés
                  </Typography>
                  <Typography variant="h5">
                    {progress.filter(p => 
                      p.steps.every(step => step.status === 'completed')
                    ).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <PlayArrowIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    En Cours
                  </Typography>
                  <Typography variant="h5">
                    {progress.filter(p => 
                      p.steps.some(step => step.status === 'in_progress')
                    ).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Progression Moyenne
                  </Typography>
                  <Typography variant="h5">
                    {progress.length > 0
                      ? Math.round(
                          progress.reduce((acc, p) => acc + getProgressPercentage(p.steps), 0) / progress.length
                        )
                      : 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progression détaillée par groupe */}
      <Grid container spacing={3}>
        {progress.map((projectProgress) => {
          const group = groups.find(g => g.id === projectProgress.groupId);
          const progressPercentage = getProgressPercentage(projectProgress.steps);
          
          return (
            <Grid item xs={12} lg={6} key={projectProgress.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {getGroupName(projectProgress.groupId)}
                    </Typography>
                    <Chip
                      label={`${Math.round(progressPercentage)}%`}
                      color={progressPercentage === 100 ? 'success' : progressPercentage > 50 ? 'primary' : 'default'}
                    />
                  </Box>

                  {group && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Coordinateur: {getUserName(group.coordinatorId)}
                    </Typography>
                  )}

                  <LinearProgress
                    variant="determinate"
                    value={progressPercentage}
                    sx={{ mb: 3, height: 8, borderRadius: 4 }}
                  />

                  <Stepper orientation="vertical">
                    {projectProgress.steps.map((step, index) => (
                      <Step key={index} active={true}>
                        <StepLabel
                          StepIconComponent={() => getStepIcon(step.status)}
                          sx={{
                            '& .MuiStepLabel-label': {
                              fontWeight: step.status === 'completed' ? 'bold' : 'normal',
                              color: step.status === 'completed' ? 'success.main' : 'inherit'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <Typography>{step.name}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                size="small"
                                label={getStepStatusLabel(step.status)}
                                color={getStepStatusColor(step.status) as any}
                              />
                              {user?.role === 'professor' && (
                                <IconButton
                                  size="small"
                                  onClick={() => openEditDialog(projectProgress.groupId, step.name, step.status)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        </StepLabel>
                        {step.completedAt && (
                          <StepContent>
                            <Typography variant="caption" color="text.secondary">
                              Terminé le {format(new Date(step.completedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                            </Typography>
                          </StepContent>
                        )}
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {progress.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucune progression à afficher
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.role === 'professor' 
              ? 'Les progressions des groupes apparaîtront ici une fois que les groupes auront été créés.'
              : 'Votre progression apparaîtra ici une fois que vous aurez été assigné à un groupe.'}
          </Typography>
        </Paper>
      )}

      {/* Dialog pour modifier l'état d'une étape */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Modifier l'état de l'étape</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Groupe: {getGroupName(selectedGroup)}
          </Typography>
          <Typography gutterBottom>
            Étape: {selectedStep}
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Nouvel état</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as 'pending' | 'in_progress' | 'completed')}
            >
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="in_progress">En cours</MenuItem>
              <MenuItem value="completed">Terminé</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button onClick={handleUpdateStep} variant="contained">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Progress;