'use server';

import { apiFetch } from '@/src/lib/api';

export const registerUser = async (values: any) => {
  const response = await apiFetch('/users/auth/register', {
    method: 'POST',
    body: {
      fullName: values.name,
      email: values.email,
      password: values.password,
    },
  });

  if (!response.ok) {
    throw new Error(response.message || 'Error al registrar el usuario.');
  }
};
