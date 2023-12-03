# SecureConnect Server
[![Chat on Matrix](https://img.shields.io/badge/chat-on_matrix-blue?link=https%3A%2F%2Fmatrix.to%2F%23%2F%23secure-connect%3Am.darkcoder15.ru)](https://matrix.to/#/#secure-connect:m.darkcoder15.ru)

**SecureConnect** is a censorship resistant proxy over WebSocket.

---
Supported modes:
- HTTP Proxy Client
- Socks Proxy Client

**SecureConnect** is made using WebSocket over HTTPS, so it needs a valid certificate and domain.

## Setting up
1. Clone this repo:
```
git clone https://github.com/DarkCoder15/SecureConnect.git
```
2. Obtain valid key & certificate.
3. Copy `config.yml.example` into `config.yml`.
4. Change `path` and `aesKey` parameters to any other. **Warning: aesKey is used to encrypt not WebSocket traffic, but only proxied traffic.**
5. Modify user list in `config.yml`. Example:
```yml
users:
  - username: user1
    password: somepassword
  - username: user2
    password: somepassword2
```
6. Replace `key_path` and `cert_path` parameter values with path to your `key.pem` and `cert.pem` files.
7. Install dependencies:
```
npm install
```
8. Start proxy:
```
node server.js
```
## Connecting to your SecureConnect instance
1. [SecureConnectCLI](https://github.com/DarkCoder15/SecureConnectCLI): SOCKS/HTTP proxy that routes traffic through SecureConnect