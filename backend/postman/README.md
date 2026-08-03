# Verificación Postman

La colección `Gradeful.postman_collection.json` recorre un escenario funcional completo sobre una base SQLite temporal.

## Ejecución automatizada

Desde `backend`:

```powershell
npm install
npm run test:postman
```

El ejecutor levanta Express en un puerto libre, genera los archivos de prueba, ejecuta Newman y termina el servidor. No modifica la base de datos local normal.

## Uso en Postman Desktop

1. Importa `Gradeful.postman_collection.json`.
2. Define `baseUrl` (por defecto `http://localhost:3000`).
3. Ejecuta `node postman/generate-fixtures.js` una vez si necesitas regenerar el Excel de importación.
4. Ejecuta la colección en orden.

La colección verifica autenticación y permisos, ciclos, grupos, inscripción, calificaciones, asistencia, justificantes, cargos, pagos, comprobantes, estado de cuenta, portal de padres, boleta PDF e importación/exportación Excel.
