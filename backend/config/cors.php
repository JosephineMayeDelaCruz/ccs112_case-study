<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Add your deployed Vercel frontend URL here once you have it,
    // e.g. 'https://walang-brownout-appliances-three.vercel.app'
    'allowed_origins' => array_filter([
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        // Add your deployed Vercel URL in FRONTEND_URL in .env
        env('FRONTEND_URL') !== 'http://localhost:5173' ? env('FRONTEND_URL') : null,
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Must be true if you switch to Sanctum's cookie-based SPA auth later.
    // Token-based auth (what this backend uses) doesn't need it, but it's
    // harmless to leave on.
    'supports_credentials' => true,
];
