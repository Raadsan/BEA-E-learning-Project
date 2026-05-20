# BEA — Server-ka VPS ku shaqeyn (production)

**Somaliga (kooban):** App-ka waa inuu Node.js ku socdaa **isla server-ka** `178.18.241.5`. Browser-ka IP-gaas wuxuu u baahan yahay in **port 2004** (frontend) iyo **7004** (backend) ay furan yihiin. Database (`3306`) kaliya ma awoodo inuu frontend/backend siiyo.

---

## 1. Waxa server-ku u baahan yahay

- **Ubuntu/Debian** (ama Linux kale) + **Node.js 20+** ([nodesource](https://github.com/nodesource/distributions) ama `nvm`)
- **MySQL/MariaDB** (haddii DB-ku server-ka yahay)
- **Git** (pull code)
- **PM2** (si app-ku u sii socdo): `npm install -g pm2`

---

## 2. Firewall & cloud panel

Fur **TCP** ports:

| Port  | Waxa ku shaqeeya   |
|-------|-------------------|
| 2004  | Next.js (website) |
| 7004  | Express (API)     |
| 3306  | MySQL (kaliya haddii aad gudaha server ugu isticmaaleyso; ha u furin internet-ka haddii loo baahnayn) |

**UFW tusaale:**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 2004/tcp
sudo ufw allow 7004/tcp
sudo ufw enable
sudo ufw status
```

Haddii VPS-kaagu leeyahay **Security Groups** (AWS, Hetzner, iwm), halkaas sidoo kale fur **2004** iyo **7004**.

---

## 3. Code server-ka ku soo deji

```bash
cd /var/www   # ama meel aad doorbideyso
git clone <REPO_URL> bea-elearning
cd bea-elearning
```

---

## 4. Backend (`.env`)

Gudaha `backend/` samee ama wac `.env` (ha ku dhicin secrets Git):

- `PORT=7004`
- `DATABASE_URL` / `DB_*` — haddii app-ku iyo MySQL **isla server** yihiin, isticmaal `127.0.0.1:3306` (wanaagsan). Haddii MySQL meel kale yahay, sida hore IP-ga database.
- `JWT_SECRET` — string adag
- `FRONTEND_URL=http://178.18.241.5:2004` (beddel IP-ga public-kaaga)

```bash
cd backend
npm ci
npm run build    # prisma generate
```

---

## 5. Frontend — muhiim: `NEXT_PUBLIC_API_URL` **build**-ga ka hor

Next.js wuxuu `NEXT_PUBLIC_*` ku dhejiyaa build-ka. Server-ka, gudaha `frontend/`:

1. Samee `frontend/.env.production` (ama `.env.local` ka hor `build`):

```env
NEXT_PUBLIC_API_URL=http://178.18.241.5:7004
```

(Beddel domain/IP-ga public-kaaga; **ha /api dhameystin** — code-ku wuxuu si otomaatig ah ugu darayaa `/api`.)

2. Build + start:

```bash
cd frontend
npm ci
npm run build
```

---

## 6. PM2 — labada wada wad

Gudaha **root** folder-ka project (meesha `ecosystem.config.cjs` ku yaalo):

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # raaci tillaha PM2 kuu soo bandhigi doono
```

Hubi:

- `http://YOUR_SERVER_IP:7004/health` → JSON `ok`
- `http://YOUR_SERVER_IP:2004` → website

**Logs:**

```bash
pm2 logs
pm2 logs bea-backend
pm2 logs bea-frontend
```

**Update kadib code change:**

```bash
git pull
cd backend && npm ci && npm run build
cd ../frontend && npm ci && npm run build
cd .. && pm2 restart all
```

---

## 7. Dhibaato caadi ah

| Calaamad | Sabab |
|----------|--------|
| `ERR_CONNECTION_REFUSED` on `:2004` / `:7004` | App ma socdo, ama firewall, ama PM2 khalad |
| Frontend API kuma helin | `NEXT_PUBLIC_API_URL` khalad ama **dib u build** la’aan ka dib .env change |
| DB connection failed | `DATABASE_URL` / firewall MySQL, ama user permissions |

---

## 7b. PM2: `online` laakiin **uptime 0s** & **restart** tiro aad u badan (crash loop)

Tani waxay ka dhigan tahay in **Node uu isla bilaabka u dhaco**; PM2 wuu mar kale isku dayayaa.

### Tallaabo 1 — arag qaladka dhabta ah (muhiim)

```bash
pm2 logs bea --lines 100
# ama
pm2 logs bea --err --lines 80
```

Halkaas waxaad arki doontaa `Error: Cannot find module`, `EADDRINUSE`, `Prisma`, iwm.

### Tallaabo 2 — jooji loop-ka, tijaabi gacanta

```bash
pm2 stop bea
cd ~/BEA-E-learning-Project/backend
node server.js
```

Haddii halkan qalad muuqdo, **taasi** waa sababta PM2 uusan shaqaynayn. Xal inta ka hor PM2 ha dib u bilowin.

### Tallaabo 3 — backend server-ka (pull kadib)

`npm i` kaliya mararka qaarkood kuma filna. Samee:

```bash
cd ~/BEA-E-learning-Project/backend
npm ci
npm run build
```

(`npm run build` wuxuu sameeyaa `prisma generate` — haddii `generated/prisma` la waayo ama generate uu fashilmo, app-ku wuu dhacayaa.)

Hubi in **`backend/.env`** server-ka ku jiro (ma imanayo Git).

### Tallaabo 4 — port 7004 laba jeer ma dhagaysan?

```bash
ss -tlnp | grep 7004
# ama
lsof -i :7004
```

Haddii laba process ay haystaan hal port, hal ka jooji ama PM2 hal app kaliya u dhig backend-ka.

### Tallaabo 5 — PM2 dib u bilow si sax ah (`cwd`)

Waa in PM2 **gudaha `backend/`** ka bilaabaa `server.js` (ama `cwd` sax ah):

```bash
pm2 delete bea
cd ~/BEA-E-learning-Project/backend
pm2 start server.js --name bea
pm2 save
```

Haddii aad isticmaaleyso `ecosystem.config.cjs`, hubi in `cwd` uu yahay **buugga backend** oo sax ah.

### Tallaabo 6 — Node version

Project-ku waa **ESM** (`"type": "module"`). U baahan tahay **Node.js 18+** (fiican 20 LTS):

```bash
node -v
```

---

## 8 (ikhtiyaari). Nginx + HTTPS

Wax badan production-ku waxay isticmaalaan Nginx `proxy_pass` → `127.0.0.1:2004` / `7004` + Let's Encrypt. Markaas `NEXT_PUBLIC_API_URL` noqo `https://api-domain-kaaga`.
