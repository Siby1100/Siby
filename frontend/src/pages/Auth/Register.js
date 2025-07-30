import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  School,
  SupervisorAccount,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        toast.success('Inscription réussie !');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Erreur d\'inscription');
      }
    } catch (error) {
      toast.error('Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  };

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
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Welcome */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ color: 'white', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                <School sx={{ fontSize: 50, mr: 2 }} />
                <Typography variant="h2" fontWeight="bold">
                  Enhanced Classroom
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Rejoignez la plateforme d'apprentissage collaboratif nouvelle génération
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Choisissez votre rôle :
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <SupervisorAccount sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        Professeur
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Créez des classes, gérez les groupes, suivez les progressions
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        textAlign: 'center',
                      }}
                    >
                      <Person sx={{ fontSize: 40, mb: 2 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        Étudiant
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Rejoignez des classes, collaborez en groupe, soumettez vos projets
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>

          {/* Right side - Registration form */}
          <Grid item xs={12} lg={6}>
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
                    Inscription
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Créez votre compte pour commencer
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        {...register('firstName', {
                          required: 'Prénom requis',
                          minLength: {
                            value: 2,
                            message: 'Le prénom doit contenir au moins 2 caractères',
                          },
                        })}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        {...register('lastName', {
                          required: 'Nom requis',
                          minLength: {
                            value: 2,
                            message: 'Le nom doit contenir au moins 2 caractères',
                          },
                        })}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

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

                  <FormControl fullWidth margin="normal" error={!!errors.role}>
                    <InputLabel>Rôle</InputLabel>
                    <Select
                      label="Rôle"
                      {...register('role', {
                        required: 'Rôle requis',
                      })}
                      defaultValue=""
                    >
                      <MenuItem value="professor">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SupervisorAccount sx={{ mr: 1 }} />
                          Professeur
                          <Chip
                            label="Gestionnaire"
                            size="small"
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </MenuItem>
                      <MenuItem value="student">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1 }} />
                          Étudiant
                          <Chip
                            label="Collaborateur"
                            size="small"
                            color="secondary"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      </MenuItem>
                    </Select>
                    {errors.role && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.role.message}
                      </Typography>
                    )}
                  </FormControl>

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
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Le mot de passe doit contenir une minuscule, une majuscule et un chiffre',
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
                    {loading ? 'Inscription...' : 'S\'inscrire'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Déjà un compte ?{' '}
                      <Link
                        to="/login"
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Se connecter
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

export default Register;