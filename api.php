<?php
/**
 * PHP Proxy for Node.js Backend API
 * Routes requests from Apache/Nginx to Node.js Express server
 */

// Configuration
define('BACKEND_HOST', 'localhost');
define('BACKEND_PORT', '3000');
define('DEBUG_MODE', false); // Set to true for debugging

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the API path from URL
$apiPath = $_SERVER['PATH_INFO'] ?? '/';

// If no path info, try to get from query string (for nginx)
if ($apiPath === '/' && isset($_GET['endpoint'])) {
    $apiPath = $_GET['endpoint'];
}

// Build backend URL
$backendUrl = 'http://' . BACKEND_HOST . ':' . BACKEND_PORT . $apiPath;

// Add query string if present
if (!empty($_SERVER['QUERY_STRING'])) {
    // Remove 'endpoint' parameter if it was used for routing
    $queryParams = [];
    parse_str($_SERVER['QUERY_STRING'], $queryParams);
    unset($queryParams['endpoint']);

    if (!empty($queryParams)) {
        $backendUrl .= '?' . http_build_query($queryParams);
    }
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get request headers
$headers = [];
foreach (getallheaders() as $name => $value) {
    // Skip host header
    if (strtolower($name) === 'host') {
        continue;
    }
    $headers[] = "$name: $value";
}

// Get request body for POST/PUT requests
$body = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $body = file_get_contents('php://input');
}

// Debug output
if (DEBUG_MODE) {
    error_log("API Proxy Debug:");
    error_log("  Method: $method");
    error_log("  Backend URL: $backendUrl");
    error_log("  Headers: " . json_encode($headers));
    error_log("  Body: $body");
}

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $backendUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Add body for POST/PUT requests
if ($body !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
}

// Execute request
$response = curl_exec($ch);

// Check for errors
if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);

    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'Backend server unavailable',
        'message' => DEBUG_MODE ? $error : 'Please try again later'
    ]);
    exit;
}

// Get response info
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

curl_close($ch);

// Separate headers and body
$responseHeaders = substr($response, 0, $headerSize);
$responseBody = substr($response, $headerSize);

// Forward response headers (except some that shouldn't be forwarded)
$skipHeaders = ['transfer-encoding', 'connection'];
foreach (explode("\r\n", $responseHeaders) as $header) {
    $headerLower = strtolower($header);
    $skip = false;

    foreach ($skipHeaders as $skipHeader) {
        if (strpos($headerLower, $skipHeader . ':') === 0) {
            $skip = true;
            break;
        }
    }

    if (!$skip && strpos($header, ':') !== false) {
        header($header, false);
    }
}

// Set response code
http_response_code($httpCode);

// Output response body
echo $responseBody;

// Debug output
if (DEBUG_MODE) {
    error_log("  Response Code: $httpCode");
    error_log("  Response Body: $responseBody");
}
