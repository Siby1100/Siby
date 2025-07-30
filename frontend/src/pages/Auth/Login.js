import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  School,
  People,
  Assignment,
  TrendingUp,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Connexion réussie !');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Erreur de connexion');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Gestion de Groupes',
      description: 'Créez des groupes avec coordinateurs et gérez les membres efficacement',
    },
    {
      icon: <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Coordination des Soumissions',
      description: 'Les coordinateurs soumettent au nom du groupe, les membres collaborent',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Suivi de Progression',
      description: 'Visualisez les étapes du projet depuis le thème jusqu\'à la version finale',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Features */}
          <Grid item xs={12} lg={7}>
            <Box sx={{ color: 'white', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h3" fontWeight="bold">
                  Enhanced Classroom
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Plateforme d'apprentissage collaboratif avec gestion avancée de groupes
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Paper
                    sx={{
                      p: 3,
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      {feature.icon}
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {feature.description}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right side - Login form */}
          <Grid item xs={12} lg={5}>
            <Card
              sx={{
                maxWidth: 500,
                mx: 'auto',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    Connexion
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Accédez à votre espace de travail collaboratif
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    margin="normal"
                    {...register('email', {
                      required: 'Email requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide',
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    margin="normal"
                    {...register('password', {
                      required: 'Mot de passe requis',
                      minLength: {
                        value: 6,
                        message: 'Le mot de passe doit contenir au moins 6 caractères',
                      },
                    })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Pas encore de compte ?{' '}
                      <Link
                        to="/register"
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        S'inscrire
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;