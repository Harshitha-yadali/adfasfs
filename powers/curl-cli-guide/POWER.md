---
name: "curl-cli-guide"
displayName: "cURL CLI Guide"
description: "Complete guide for using cURL command-line tool for HTTP requests, file transfers, and API testing with practical examples and troubleshooting."
keywords: ["curl", "http", "api", "cli", "requests", "download"]
author: "Kiro User"
---

# cURL CLI Guide

## Overview

cURL is a powerful command-line tool for transferring data with URLs. It supports numerous protocols including HTTP, HTTPS, FTP, and more. This guide covers practical usage patterns for web development, API testing, and file transfers.

Whether you're testing REST APIs, downloading files, or debugging HTTP requests, cURL provides the flexibility and control you need from the command line.

## Onboarding

### Installation

#### Windows
```bash
# cURL comes pre-installed on Windows 10+ 
curl --version

# If not available, install via chocolatey
choco install curl

# Or download from: https://curl.se/windows/
```

#### macOS
```bash
# Pre-installed on macOS
curl --version

# Or install latest via Homebrew
brew install curl
```

#### Linux (Ubuntu/Debian)
```bash
# Usually pre-installed
curl --version

# If not available
sudo apt update
sudo apt install curl
```

### Prerequisites
- Command line access
- Basic understanding of HTTP methods (GET, POST, PUT, DELETE)
- Optional: API keys for testing authenticated endpoints

### Verification
```bash
# Verify installation
curl --version

# Expected output:
# curl 7.x.x (platform) libcurl/7.x.x ...
```

## Common Workflows

### Workflow: Basic HTTP Requests

**Goal:** Make simple HTTP requests to test APIs and web services

**Commands:**
```bash
# GET request (default method)
curl https://api.example.com/users

# GET with headers
curl -H "Accept: application/json" https://api.example.com/users

# POST request with data
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}' \
  https://api.example.com/users

# PUT request
curl -X PUT -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}' \
  https://api.example.com/users/123
```

**Complete Example:**
```bash
# Test a public API
curl -H "Accept: application/json" \
  https://jsonplaceholder.typicode.com/posts/1

# Expected response:
# {
#   "userId": 1,
#   "id": 1,
#   "title": "sunt aut facere...",
#   "body": "quia et suscipit..."
# }
```

### Workflow: File Downloads

**Goal:** Download files from web servers

**Commands:**
```bash
# Download file (keeps original name)
curl -O https://example.com/file.zip

# Download with custom name
curl -o myfile.zip https://example.com/file.zip

# Download with progress bar
curl --progress-bar -O https://example.com/largefile.zip

# Resume interrupted download
curl -C - -O https://example.com/largefile.zip
```

**Complete Example:**
```bash
# Download a sample file
curl -o sample.json https://jsonplaceholder.typicode.com/posts

# Verify download
ls -la sample.json
```

### Workflow: API Authentication

**Goal:** Make authenticated requests to protected APIs

**Commands:**
```bash
# Basic authentication
curl -u username:password https://api.example.com/protected

# Bearer token authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/protected

# API key in header
curl -H "X-API-Key: YOUR_API_KEY" \
  https://api.example.com/protected

# API key in query parameter
curl "https://api.example.com/protected?api_key=YOUR_API_KEY"
```

## Command Reference

### curl

**Purpose:** Transfer data from or to servers using various protocols

**Syntax:**
```bash
curl [options] [URL...]
```

**Common Options:**
| Flag | Description | Example |
|------|-------------|---------|
| `-X, --request` | HTTP method | `-X POST` |
| `-H, --header` | Add header | `-H "Content-Type: application/json"` |
| `-d, --data` | Send data | `-d '{"key":"value"}'` |
| `-o, --output` | Write output to file | `-o filename.txt` |
| `-O, --remote-name` | Use remote filename | `-O` |
| `-u, --user` | Authentication | `-u user:pass` |
| `-v, --verbose` | Verbose output | `-v` |
| `-s, --silent` | Silent mode | `-s` |
| `-L, --location` | Follow redirects | `-L` |
| `-C, --continue-at` | Resume download | `-C -` |

**Examples:**
```bash
# Verbose GET request
curl -v https://httpbin.org/get

# Silent POST with JSON
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"test":"data"}' https://httpbin.org/post

# Follow redirects
curl -L https://github.com

# Save response headers
curl -D headers.txt https://example.com
```

## Troubleshooting

### Error: "curl: command not found"
**Cause:** cURL is not installed or not in PATH
**Solution:**
1. Check if installed: `which curl` (Linux/macOS) or `where curl` (Windows)
2. Install using package manager (see Installation section)
3. Restart terminal after installation

### Error: "SSL certificate problem"
**Cause:** SSL certificate verification failed
**Solution:**
1. **Recommended:** Fix the certificate issue on the server
2. **For testing only:** Skip verification with `-k` flag:
   ```bash
   curl -k https://example.com
   ```
3. Specify CA bundle: `curl --cacert /path/to/cert.pem https://example.com`

### Error: "Connection refused" or "Connection timeout"
**Cause:** Server is unreachable or blocking requests
**Solution:**
1. Verify URL is correct
2. Check network connectivity: `ping example.com`
3. Try with verbose flag: `curl -v https://example.com`
4. Check if proxy is needed: `curl --proxy http://proxy:port https://example.com`

### Error: "HTTP 401 Unauthorized"
**Cause:** Authentication required or credentials invalid
**Solution:**
1. Verify credentials are correct
2. Check authentication method (Basic, Bearer, API key)
3. Ensure proper header format:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com
   ```

### Error: "HTTP 403 Forbidden"
**Cause:** Server denying access (permissions, rate limiting, etc.)
**Solution:**
1. Check if API key/token has required permissions
2. Verify rate limits haven't been exceeded
3. Add User-Agent header if required:
   ```bash
   curl -H "User-Agent: MyApp/1.0" https://api.example.com
   ```

## Best Practices

- **Use HTTPS** whenever possible for secure data transmission
- **Include User-Agent** header for API requests to identify your application
- **Handle errors gracefully** by checking HTTP status codes with `-w "%{http_code}"`
- **Use verbose mode** (`-v`) for debugging connection issues
- **Store sensitive data** (API keys, passwords) in environment variables, not command history
- **Follow redirects** with `-L` when working with modern web services
- **Set timeouts** with `--connect-timeout` and `--max-time` for production scripts
- **Use configuration files** (`~/.curlrc`) for frequently used options

## Configuration

**No additional configuration required** - cURL works out of the box after installation.

**Optional Configuration File (`~/.curlrc`):**
```bash
# Default options for all curl commands
user-agent = "MyApp/1.0"
connect-timeout = 10
max-time = 30
location
```

**Environment Variables:**
- `CURL_CA_BUNDLE`: Path to CA certificate bundle
- `http_proxy`: HTTP proxy server
- `https_proxy`: HTTPS proxy server

---

**CLI Tool:** `curl`
**Installation:** Pre-installed on most systems, or via package managers