import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Button
} from '@mui/material';
import {
  School as ClassIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Message as MessageIcon,
  Announcement as AnnouncementIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { classApi, groupApi, assignmentApi, announcementApi, projectProgressApi } from '../services/api';
import { Class, Group, Assignment, Announcement, ProjectProgress } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [progress, setProgress] = useState<ProjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'professor') {
          const classesData = await classApi.getByProfessor(user.id);
          setClasses(classesData);
          
          if (classesData.length > 0) {
            const classIds = classesData.map(c => c.id);
            const groupsData = await Promise.all(
              classIds.map(id => groupApi.getByClass(id))
            );
            setGroups(groupsData.flat());

            const assignmentsData = await Promise.all(
              classIds.map(id => assignmentApi.getByClass(id))
            );
            setAssignments(assignmentsData.flat());

            const announcementsData = await Promise.all(
              classIds.map(id => announcementApi.getByClass(id))
            );
            setAnnouncements(announcementsData.flat().slice(0, 5));
          }
        } else {
          const classesData = await classApi.getByStudent(user!.id);
          setClasses(classesData);
          
          const groupsData = await groupApi.getByMember(user!.id);
          setGroups(groupsData);

          if (classesData.length > 0) {
            const classIds = classesData.map(c => c.id);
            const assignmentsData = await Promise.all(
              classIds.map(id => assignmentApi.getByClass(id))
            );
            setAssignments(assignmentsData.flat());

            const announcementsData = await Promise.all(
              classIds.map(id => announcementApi.getByClass(id))
            );
            setAnnouncements(announcementsData.flat().slice(0, 5));
          }

          if (groupsData.length > 0) {
            const progressData = await Promise.all(
              groupsData.map(g => projectProgressApi.getByGroup(g.id))
            );
            setProgress(progressData.flat());
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getProgressPercentage = (steps: any[]) => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Chargement du tableau de bord...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Bienvenue, {user?.name} !
      </Typography>

      <Grid container spacing={3}>
        {/* Statistiques générales */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <ClassIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Classes
                  </Typography>
                  <Typography variant="h5">
                    {classes.length}
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
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <GroupsIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    {user?.role === 'professor' ? 'Groupes' : 'Mon Groupe'}
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
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AssignmentIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Devoirs
                  </Typography>
                  <Typography variant="h5">
                    {assignments.length}
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Progression
                  </Typography>
                  <Typography variant="h5">
                    {progress.length > 0 
                      ? `${Math.round(getProgressPercentage(progress[0]?.steps || []))}%`
                      : '0%'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Progression du projet (pour les étudiants) */}
        {user?.role === 'student' && progress.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progression du Projet
                </Typography>
                {progress[0]?.steps.slice(0, 8).map((step, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{step.name}</Typography>
                      <Chip
                        size="small"
                        label={
                          step.status === 'completed' ? 'Terminé' :
                          step.status === 'in_progress' ? 'En cours' : 'En attente'
                        }
                        color={
                          step.status === 'completed' ? 'success' :
                          step.status === 'in_progress' ? 'warning' : 'default'
                        }
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={step.status === 'completed' ? 100 : step.status === 'in_progress' ? 50 : 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                ))}
                <Button 
                  variant="outlined" 
                  size="small" 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: 1 }}
                >
                  Voir toute la progression
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Dernières annonces */}
        <Grid item xs={12} md={user?.role === 'student' && progress.length > 0 ? 6 : 12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dernières Annonces
              </Typography>
              {announcements.length > 0 ? (
                <List dense>
                  {announcements.map((announcement) => (
                    <ListItem key={announcement.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                          <AnnouncementIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={announcement.title}
                        secondary={
                          <>
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {announcement.content.substring(0, 100)}...
                            </Typography>
                            <br />
                            {format(new Date(announcement.createdAt), 'dd MMMM yyyy', { locale: fr })}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Aucune annonce récente
                </Typography>
              )}
              <Button 
                variant="outlined" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 1 }}
              >
                Voir toutes les annonces
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Classes récentes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {user?.role === 'professor' ? 'Mes Classes' : 'Classes'}
              </Typography>
              <Grid container spacing={2}>
                {classes.map((classItem) => (
                  <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 140,
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                    >
                      <Typography variant="h6" noWrap>
                        {classItem.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {classItem.code}
                      </Typography>
                      <Typography variant="body2" sx={{ flexGrow: 1, mt: 1 }}>
                        {classItem.description}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${classItem.students.length} étudiants`}
                        sx={{ alignSelf: 'flex-start', mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              {classes.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  {user?.role === 'professor' 
                    ? 'Aucune classe créée. Commencez par créer votre première classe !'
                    : 'Vous n\'êtes inscrit à aucune classe. Rejoignez une classe avec le code fourni par votre professeur.'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;