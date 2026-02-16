# Frontend UI (static)

Interfaccia grafica avanzata (tema Ferretto) per il backend NestJS (`/api`).

## Avvio rapido

Modalita consigliata: avvia il backend, che serve automaticamente il frontend su `/app`.

Da `C:\iberfosle\backend`:

```powershell
npm run dev:server:start
```

Apri:

- `http://localhost:3000/app/`

Modalita alternativa (solo frontend statico):

Da `C:\iberfosle\backend\frontend`:

```powershell
python -m http.server 5173
```

Apri:

- `http://localhost:5173`

## Funzioni incluse

- UI responsive con sidebar, cruscotto KPI, board operativa e control room
- Check health backend (`/api/health`)
- Form login (`/api/auth/login`)
- Form register (`/api/auth/register`)
- CRUD base:
  - create `projects`, `machines`, `issues`
  - create `assignments`, `reports`
  - update status `issues`
  - delete `projects`, `machines`
- Kanban issues per stato
- Timeline assegnazioni
- Ricerca globale sui dataset
- Export snapshot JSON
- Auto-refresh dati ogni 30 secondi (toggle)
- Sessione utente (`/api/users/me`)
- Caricamento dati: `projects`, `machines`, `issues`, `reports`, `assignments`
- Salvataggio API base e JWT in `localStorage`

## Note

- API base predefinita: `http://localhost:3000/api`
- Per endpoint protetti serve token JWT valido (ottenuto via login)
