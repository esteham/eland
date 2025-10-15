<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Bearer token pass-through
  RewriteCond %{HTTP:Authorization} .
  RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

  # Serve storage files WITHOUT symlink 
  RewriteRule ^api/storage/(.*)$ backend/storage/app/public/$1 [L]
  
  # backend/public/.htaccess (optional fallback)
  RewriteRule ^storage/(.*)$ ../storage/app/public/$1 [L]


  # Forward all other /api/* into Laravel 
  RewriteRule ^api(?:/(.*))?$ backend/public/index.php [L,QSA]

  # SPA fallback 
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . index.html [L]
</IfModule>
