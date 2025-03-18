# Utilisation de l'image officielle de Bun
FROM oven/bun:latest

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires
COPY . .

# Installer les dépendances
RUN bun install

# Générer les fichiers Prisma
RUN bunx prisma generate

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["bun", "run", "src/index.ts"]
