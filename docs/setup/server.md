# Memo serveur - rhandr-prod

## Infos generales

| Element | Valeur |
|---|---|
| **Hebergeur** | Hetzner (CPX22) |
| **OS** | Debian 12 |
| **IP** | 46.224.152.92 |
| **Datacenter** | Nuremberg |
| **Domaine** | rhandr.me |
| **Registrar domaine** | Namecheap (namecheap.com) |
| **DNS** | Cloudflare (dash.cloudflare.com) |
| **SSH Key** | `C:\Users\rochb\.ssh\id_ed25519` |

## Comptes et acces

### Hetzner (serveur)
- URL : https://accounts.hetzner.com
- Email : ahandriou.rochdi@gmail.com

### Namecheap (domaine)
- URL : https://www.namecheap.com
- Gestion domaine : Dashboard → Manage → rhandr.me

### Cloudflare (DNS)
- URL : https://dash.cloudflare.com
- Email : ahandriou.rochdi@gmail.com
- DNS Records : section DNS → rhandr.me
- SSL : section SSL/TLS → mode Full

---

## Commandes depuis ton PC (PowerShell)

### Se connecter au serveur en SSH
```powershell
ssh root@46.224.152.92
```

### Acceder a phpMyAdmin (tunnel SSH)
```powershell
ssh -L 8888:127.0.0.1:8888 root@46.224.152.92
```
Puis ouvrir : **http://localhost:8888**
- Utilisateur MySQL : `rhandr`
- Mot de passe : (celui defini a l'installation)

### Envoyer des fichiers sur le serveur
```powershell
scp chemin\local\fichier.ext root@46.224.152.92:/chemin/serveur/
```

### Envoyer un dossier entier
```powershell
scp -r chemin\local\dossier root@46.224.152.92:/chemin/serveur/
```

### Si SCP demande un mot de passe (cle SSH pas chargee)
```powershell
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add C:\Users\rochb\.ssh\id_ed25519
```
Puis retenter la commande scp.

---

## Commandes sur le serveur (SSH)

### PM2 (gestion du serveur Node.js)
```bash
pm2 status                  # Voir les process
pm2 logs noxi-api           # Voir les logs
pm2 logs noxi-api --lines 50  # Voir les 50 dernieres lignes
pm2 restart noxi-api        # Redemarrer l'API
pm2 stop noxi-api           # Arreter l'API
pm2 start noxi-api          # Demarrer l'API
pm2 save                    # Sauvegarder la config (survit au reboot)
```

### Deployer une mise a jour du code
```bash
cd /var/www/noxi
git pull
npm install
npm run build
pm2 restart noxi-api
```

### Nginx
```bash
nginx -t                    # Tester la config (toujours faire avant restart)
systemctl restart nginx     # Redemarrer Nginx
systemctl status nginx      # Verifier le statut
```

### MariaDB (MySQL)
```bash
mysql -u rhandr -p          # Se connecter en ligne de commande
systemctl restart mariadb   # Redemarrer MySQL
```

### Importer un fichier SQL
```bash
mysql -u rhandr -p noxi < /chemin/vers/fichier.sql
```

### Exporter la base de donnees
```bash
mysqldump -u rhandr -p noxi > /tmp/noxi_backup.sql
```

### Voir l'espace disque
```bash
df -h                       # Espace disque global
du -sh /var/www/noxi/       # Taille du projet
```

### Voir la memoire
```bash
free -h
```

---

## Sous-domaines configures

| Sous-domaine | Usage | Config Nginx |
|---|---|---|
| noxi.rhandr.me | Plateforme de jeu | `/etc/nginx/sites-available/noxi.rhandr.me` |

## Ajouter un nouveau sous-domaine

**1. Cloudflare** (dash.cloudflare.com → rhandr.me → DNS) :
- Add record → Type **A** → Name **nouveau** → Content **46.224.152.92** → Proxied

**2. Serveur** (SSH) : Creer la config Nginx :
```bash
nano /etc/nginx/sites-available/nouveau.rhandr.me
```

Contenu minimal pour un site statique :
```nginx
server {
    listen 80;
    server_name nouveau.rhandr.me;
    root /var/www/nouveau/;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**3. Activer et redemarrer :**
```bash
ln -s /etc/nginx/sites-available/nouveau.rhandr.me /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

---

## Chemins importants sur le serveur

| Chemin | Description |
|---|---|
| `/var/www/` | Racine de tous les projets web |
| `/var/www/noxi/` | Projet Noxi (code source) |
| `/var/www/noxi/dist/` | Build frontend (servi par Nginx) |
| `/var/www/noxi/server/` | Backend Node.js |
| `/var/www/noxi/server/uploads/` | Fichiers uploades (images jeux, events) |
| `/var/www/noxi/.env` | Variables d'environnement (NE PAS COMMIT) |
| `/etc/nginx/sites-available/` | Configs Nginx (tous les sites) |
| `/etc/nginx/sites-enabled/` | Sites actifs (liens symboliques) |
| `/etc/nginx/conf.d/` | Config globale Nginx |
| `/usr/share/phpmyadmin/` | phpMyAdmin |
| `/root/.ssh/` | Cles SSH du serveur |
| `/root/SERVER_DOC.md` | Ce memo (copie sur le serveur) |

## Services installes

| Service | Port | Details |
|---|---|---|
| Node.js 20 (Express) | 5000 | API REST backend |
| Node.js (WebSocket) | 9090 | Communication temps reel |
| Nginx | 80/443 | Reverse proxy, sert le frontend |
| MariaDB | 3306 | Base de donnees (localhost only) |
| phpMyAdmin | 8888 | Admin BDD (localhost only, via tunnel SSH) |
| PM2 | - | Process manager (demarre Node au boot) |

## SSL / HTTPS

Le SSL est gere par **Cloudflare** (mode Full). Les visiteurs accedent en HTTPS via Cloudflare, qui communique avec le serveur.

Pour ajouter un certificat sur le serveur (optionnel, pour Full Strict) :
```bash
certbot --nginx -d noxi.rhandr.me
certbot renew --dry-run               # Tester le renouvellement auto
```

## En cas de probleme

### Le site ne repond pas
```bash
pm2 status                  # Verifier que noxi-api est "online"
pm2 restart noxi-api        # Redemarrer si besoin
systemctl status nginx      # Verifier Nginx
```

### Erreur 502 Bad Gateway
```bash
pm2 logs noxi-api --lines 20   # Voir les erreurs Node
```

### Erreur 413 (upload trop gros)
Verifier que `/etc/nginx/conf.d/upload.conf` contient :
```
client_max_body_size 20M;
```

### La BDD ne repond pas
```bash
systemctl status mariadb    # Verifier le statut
systemctl restart mariadb   # Redemarrer
```

### Purger le cache Cloudflare
Cloudflare → rhandr.me → Caching → Configuration → Purge Everything
