# Ersetze PORT-Definition und listen() call
sed -i "s/const PORT = process.env.PORT || 3001;/const PORT = parseInt(process.env.PORT || '3001', 10);/" src/index.ts
sed -i "s/server.listen(PORT, '0.0.0.0'/server.listen(PORT, '0.0.0.0'/" src/index.ts
