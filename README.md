# BPS – Bee Protection System

V1 mobile-first para monitoramento de colmeias, com FastAPI/MySQL, Vue 3/PWA e recepção idempotente de telemetria ESP32. O sistema não comanda a liberação de ácido e não retransmite a câmera local.

## Estrutura

- `backend/`: API, modelos SQLAlchemy, autenticação por sessão, Alembic e testes.
- `frontend/`: Vue 3, TypeScript, Tailwind, Pinia, ECharts e PWA.
- `scripts/simulate_esp32.py`: gerador de telemetria explicitamente simulada.
- `deploy/`: exemplos de systemd e proxy Apache/HTTPS.

## Desenvolvimento

Requisitos: Python 3.11+, Node.js 20+ e MySQL 8.

### MySQL e backend

No cPanel/WHM, crie um banco e um usuário dedicado, conceda somente privilégios sobre esse banco e guarde a senha fora do repositório. No MySQL CLI, o equivalente é:

```sql
CREATE DATABASE bps CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bps_user'@'localhost' IDENTIFIED BY 'uma-senha-forte';
GRANT ALL PRIVILEGES ON bps.* TO 'bps_user'@'localhost';
FLUSH PRIVILEGES;
```

```bash
cd backend
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env
# Edite DATABASE_URL, SECRET_KEY, ALLOWED_ORIGINS e SESSION_HTTPS_ONLY.
alembic upgrade head
python -m app.cli create-user
python -m app.cli create-device
uvicorn app.main:app --reload
```

O comando de usuário solicita a senha sem ecoá-la. O comando de dispositivo mostra a chave uma única vez; armazene-a com segurança. Em produção, use uma `SECRET_KEY` aleatória com pelo menos 32 bytes, HTTPS e `SESSION_HTTPS_ONLY=true`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abra `http://localhost:5173`. Para produção, execute `npm run build` e publique `frontend/dist`.

### Simulador ESP32

```bash
pip install httpx
python scripts/simulate_esp32.py --device-id BPS-001 --api-key "CHAVE_GERADA"
python scripts/simulate_esp32.py --device-id BPS-001 --api-key "CHAVE_GERADA" --continuous --interval 30
```

O simulador nunca aciona equipamentos e todos os seus eventos incluem `simulated: true`.

### Testes

```bash
cd backend
pytest -q
cd ../frontend
npm run build
```

## API

A documentação interativa fica em `/docs`. Endpoints privados exigem cookie HttpOnly e, para alterações, `X-CSRF-Token`. O webhook usa `X-Device-Key`, separada da sessão humana. Eventos repetidos pelo par dispositivo/evento retornam `status: duplicate` sem novas gravações.

## Deploy WHM/cPanel

1. Identifique a distribuição e as políticas do servidor antes de instalar pacotes.
2. Crie banco/usuário no cPanel e execute `alembic upgrade head` no ambiente virtual.
3. Gere o build Vue e copie `dist` para o caminho servido pelo Apache.
4. Adapte os exemplos em `deploy/` aos caminhos, usuário e certificados do host.
5. Instale e habilite o serviço systemd somente com aprovação administrativa.
6. Use AutoSSL/HTTPS e restrinja `ALLOWED_ORIGINS` ao domínio real.

Os exemplos não alteram automaticamente WHM, Apache ou systemd.

## Limitações conhecidas

- Sem imagem do Figma no material recebido; a interface segue a identidade textual e está preparada para refinamento.
- Limitação de login é local ao processo. Em implantação com múltiplos workers, use Redis ou o rate limit do proxy para coordenação global.
- O stream MJPEG depende da rede local e pode ser bloqueado por mixed content; a UI oferece abertura direta e nunca envia vídeo ao servidor.
- Limites científicos para alertas não são presumidos. Devem ser definidos com especialistas antes da automação de alertas.
- Consumo químico só aparece quando o dispositivo fornece quantidade e unidade válidas.
