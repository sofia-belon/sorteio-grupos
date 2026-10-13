@echo off
title Sorteio de Grupos
cd /d "%~dp0build"
start "" http://localhost:3333
echo Servidor rodando em http://localhost:3333
echo Feche esta janela para parar o servidor.
"C:\Program Files\nodejs\node.exe" bin\server.js
pause
