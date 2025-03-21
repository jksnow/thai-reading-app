# Setting Up Firebase Redirect Authentication Proxy

## Problem Context

The mobile sign-in issues with Firebase's `signInWithRedirect()` method are related to third-party cookie and storage blocking in modern browsers. Firebase's redirect authentication flow requires access to storage across domains, which is increasingly being restricted by browsers like Safari, Firefox, and Chrome.

## Solution: Proxy Auth Requests

We've implemented Option 3 from Firebase's [redirect best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices): setting up a reverse proxy for auth requests.

## Server Configuration Instructions

You need to configure your server to proxy requests from `/__/auth/` on your domain to the corresponding Firebase project domain.

### Nginx Configuration

If you're using Nginx, add this to your server configuration:

```nginx
# Proxy for Firebase Auth requests
location /__/auth/ {
  proxy_pass https://thai-tale.firebaseapp.com/__/auth/;
  proxy_set_header Host thai-tale.firebaseapp.com;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Apache Configuration

If you're using Apache with mod_proxy, add this to your configuration:

```apache
ProxyPass /__/auth/ https://thai-tale.firebaseapp.com/__/auth/
ProxyPassReverse /__/auth/ https://thai-tale.firebaseapp.com/__/auth/
```

### Express.js Server Configuration

```javascript
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

// Proxy Firebase Auth requests
app.use(
  "/__/auth",
  createProxyMiddleware({
    target: "https://thai-tale.firebaseapp.com",
    changeOrigin: true,
  })
);

// Your other routes and middleware
// ...

app.listen(3000, () => console.log("Server running on port 3000"));
```

## Vercel Configuration

If you're hosting on Vercel, add this to your `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/__/auth/:path*",
      "destination": "https://thai-tale.firebaseapp.com/__/auth/:path*"
    }
  ]
}
```

## Netlify Configuration

If you're hosting on Netlify, add this to your `_redirects` file or `netlify.toml`:

```
# _redirects file
/__/auth/*  https://thai-tale.firebaseapp.com/__/auth/:splat  200

# OR netlify.toml
[[redirects]]
  from = "/__/auth/*"
  to = "https://thai-tale.firebaseapp.com/__/auth/:splat"
  status = 200
  force = true
```

## Important Notes

1. The proxy setup must:

   - Forward the requests transparently (not as a redirect)
   - Preserve all query parameters and headers
   - Return the response directly to the client

2. After implementing the proxy, verify it works by testing the sign-in flow again on mobile devices.

3. This solution allows the redirect flow to complete successfully by eliminating the cross-origin storage access that gets blocked by browsers.
