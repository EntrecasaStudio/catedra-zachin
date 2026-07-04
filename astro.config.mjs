// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://catedrazachin.ar',
  // La propuesta ahora vive en el root; redirigimos las rutas viejas /propuesta/*
  redirects: {
    '/propuesta': '/',
    '/propuesta/nivel-1': '/nivel-1',
    '/propuesta/nivel-2': '/nivel-2',
    '/propuesta/equipo': '/equipo',
    '/propuesta/galeria': '/galeria',
    '/propuesta/contacto': '/contacto',
    '/propuesta/componentes': '/componentes',
  },
});
