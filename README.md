# 🚀 RSS Proxy Server

A lightweight, self-hosted **RSS proxy** that fetches, caches, and serves multiple RSS feeds.  
Ideal for preventing **502 errors**, ensuring **stable RSS delivery**, and **rehosting unreliable feeds**.

## 🎯 Features

- 📡 Fetch & cache multiple RSS feeds
- 🚀 Serve cached feeds via API (`/rss/:feedName`)
- 🔄 Auto-refresh feeds every 5 minutes (configurable)
- 🛠 Uses PM2 for background execution
- 💡 Easy to deploy and run

## 📥 Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/YOUR-USERNAME/rss-proxy-server.git
cd rss-proxy-server
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Add RSS Feeds

Edit feeds.json to include your RSS sources:

```json
{
  "feeds": [
    { "name": "Feed1", "url": "https://original-rss-feed-url1.com/rss" },
    { "name": "Feed2", "url": "https://original-rss-feed-url2.com/rss" },
    { "name": "Feed3", "url": "https://original-rss-feed-url3.com/rss" }
  ]
}
```

### 4️⃣ Start the Server

```sh
node server.js
```

OR run with PM2 (recommended):

```sh
pm2 start server.js --name rss-proxy
pm2 save
pm2 startup
```

## 🔗 API Usage

Once running, access your feeds at:

```
http://your-server-ip:3000/rss/Feed1
http://your-server-ip:3000/rss/Feed2
http://your-server-ip:3000/rss/Feed3
```

### 🛠 Nginx Reverse Proxy (Optional)

If deploying on a domain, set up an Nginx proxy:

```
server {
listen 80;
server_name rss.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

}
```

Then restart Nginx:

```sh
sudo systemctl restart nginx
```

## 🏆 Contributing

Feel free to fork the repo, create a pull request, or open an issue.
Help make this RSS proxy even better! 🚀
