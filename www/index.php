<?php

// absolute filesystem path to this web root
define('WWW_DIR', __DIR__);

// absolute filesystem path to the application root
define('APP_DIR', WWW_DIR . '/../app');

// absolute filesystem path to the libraries
define('LIBS_DIR', WWW_DIR . '/../libs');

// absolute filesystem path to the tests files
define('TESTS_DIR', WWW_DIR . '/../tests');

// load bootstrap file
require APP_DIR . '/bootstrap.php';
