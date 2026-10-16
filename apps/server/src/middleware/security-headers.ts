import helmet from 'helmet';

// Imported editor images use object URLs; keep all other Helmet defaults.
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: { imgSrc: ["'self'", 'data:', 'blob:'] },
  },
});
