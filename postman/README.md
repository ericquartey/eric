# Postman Quick Start

## Files
- `postman/Ferretto-Backend.postman_collection.json`
- `postman/Ferretto-Local.postman_environment.json`

## Recommended execution order
1. `Auth -> POST Register Admin` (solo prima volta)
2. `Auth -> POST Login` (salva automaticamente `token` e `currentUserId`)
3. `Projects -> POST Create Project` (salva `projectId`)
4. `Machines -> POST Create Machine` (salva `machineId`)
5. `Issues -> POST Create Issue` (salva `issueId`)
6. `Reports -> POST Create Report` (salva `reportId`)
7. `Chat REST -> POST Chat Message` (salva `chatMessageId`)
8. `Attachments -> POST Upload Attachment to Issue`

## Variables to set manually
- `installerUserId`: id utente installatore (per endpoint assegnazioni)
- `sampleFilePath`: file reale locale da inviare in upload

## Notes
- Tutte le richieste protette usano `Authorization: Bearer {{token}}`.
- Per `POST /api/attachments/upload`, Postman deve usare `form-data` con campo `file`.
- Realtime Socket.IO (`/chat`) non e incluso nella collection REST. Se vuoi, preparo anche una mini guida client Socket.IO.
