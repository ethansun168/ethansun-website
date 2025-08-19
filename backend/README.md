# Ethan Website Backend
Backend API built with Hono and ngrok

## [Install ngrok](https://dashboard.ngrok.com/get-started/setup)

## Deploying
Build and run the hono app
```
npm run build
npm start
```

## ngrok
Paste the following config into `~/.config/ngrok/ngrok.yml`
```yaml
version: "3"
agent:
    authtoken: <AUTH_TOKEN>
endpoints:
  - name: ethan-website-backend
    url: famous-wealthy-seal.ngrok-free.app
    upstream:
      url: 3000
```
The port should match the port from `index.ts`

Set up the ngrok service
```
sudo ngrok service install --config=~/.config/ngrok/ngrok.yml
sudo ngrok service start
# Check service status
systemctl status ngrok
# Stop the service
sudo ngrok service stop
```

## Development
```
npm install
npm run dev
```
