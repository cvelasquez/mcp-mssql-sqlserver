# MCP SQL Server

Servidor MCP (Model Context Protocol) para interactuar con múltiples instancias de SQL Server desde Claude Desktop.

## Versión 2.0 - Características

- **Múltiples conexiones centralizadas**: Todas las conexiones definidas en `connections.json`
- **Agrupación por cliente**: Organiza conexiones por `connectionGroup`
- **Descripciones detalladas**: Cada conexión incluye una descripción para identificar propósito/sede
- **Metadata en respuestas**: Todas las operaciones incluyen información de la conexión utilizada
- **Recarga en caliente**: Actualiza conexiones sin reiniciar Claude Desktop con `reload_connections`
- **Pool de conexiones**: Reutilización eficiente de conexiones activas
- **Planes de ejecución**: Análisis detallado de rendimiento de queries
- **Análisis de stored procedures**: Obtención y análisis de definiciones de SPs

## Instalación

```bash
cd C:\mcp-sqlserver
npm install
```

## Configuración

### 1. Archivo connections.json

Define todas tus conexiones en el archivo `connections.json`:

```json
{
  "connections": [
    {
      "name": "minsur-raura",
      "connectionGroup": "Minsur",
      "description": "Base de datos sede Raura",
      "server": "192.168.1.10\\SQLEXPRESS",
      "database": "Minsur_Raura",
      "user": "sa",
      "password": "tu_password",
      "port": 1433,
      "encrypt": false,
      "trustServerCertificate": true
    },
    {
      "name": "minsur-sanrafael",
      "connectionGroup": "Minsur",
      "description": "Base de datos sede San Rafael",
      "server": "192.168.1.11",
      "database": "Minsur_SanRafael",
      "user": "sa",
      "password": "tu_password",
      "port": 1433,
      "encrypt": false,
      "trustServerCertificate": true
    },
    {
      "name": "yanacocha-cajamarca",
      "connectionGroup": "Yanacocha",
      "description": "Sede Cajamarca - Base de datos producción",
      "server": "10.202.82.15",
      "database": "Yanacocha_Cajamarca",
      "user": "app_user",
      "password": "secure_password",
      "port": 1433,
      "encrypt": false,
      "trustServerCertificate": true
    }
  ]
}
```

**Campos de configuración:**
- `name` (string, requerido): Identificador único de la conexión
- `connectionGroup` (string, requerido): Grupo al que pertenece (ej: cliente, proyecto)
- `description` (string, requerido): Descripción detallada de la conexión
- `server` (string, requerido): Servidor SQL Server (puede incluir instancia)
- `database` (string, requerido): Nombre de la base de datos
- `user` (string, requerido): Usuario de SQL Server
- `password` (string, requerido): Contraseña
- `port` (number, requerido): Puerto (generalmente 1433)
- `encrypt` (boolean, requerido): Encriptar la conexión
- `trustServerCertificate` (boolean, requerido): Confiar en certificado del servidor

### 2. Claude Desktop Config

En tu archivo `claude_desktop_config.json`, solo necesitas agregar una vez el MCP:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": ["C:\\mcp-sqlserver\\index.js"]
    }
  }
}
```

**¡Importante!** Ya no necesitas crear una entrada separada por cada conexión. Todas se gestionan desde `connections.json`.

## Herramientas disponibles

### 1. list_connections
Lista todas las conexiones disponibles agrupadas por `connectionGroup`.

**Parámetros:** Ninguno

**Ejemplo de uso en Claude:**
```
Lista todas las conexiones SQL Server disponibles
```

**Respuesta:**
```
Available SQL Server Connections:

Minsur:
  - minsur-raura
    Description: Base de datos sede Raura
    Server: 192.168.1.10\SQLEXPRESS
    Database: Minsur_Raura

  - minsur-sanrafael
    Description: Base de datos sede San Rafael
    Server: 192.168.1.11
    Database: Minsur_SanRafael

Yanacocha:
  - yanacocha-cajamarca
    Description: Sede Cajamarca - Base de datos producción
    Server: 10.202.82.15
    Database: Yanacocha_Cajamarca
```

---

### 2. reload_connections ⚡ NUEVO
Recarga el archivo `connections.json` sin necesidad de reiniciar Claude Desktop. Cierra automáticamente los pools de conexión obsoletos y carga la nueva configuración.

**Parámetros:** Ninguno

**Ejemplo de uso en Claude:**
```
Recarga las conexiones de SQL Server
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Connections reloaded successfully",
  "totalConnections": 8,
  "closedPools": 2,
  "connectionNames": [
    "minsur-raura",
    "minsur-sanrafael",
    "yanacocha-cajamarca",
    ...
  ]
}
```

**Casos de uso:**
- Agregar nuevas conexiones sin interrumpir el trabajo
- Modificar credenciales o configuración de conexiones existentes
- Eliminar conexiones obsoletas
- Actualizar descripciones o grupos de conexiones

---

### 3. query
Ejecuta una consulta SQL y retorna los resultados con metadata de la conexión.

**Parámetros:**
- `connection` (string, requerido): Nombre de la conexión a usar
- `sql` (string, requerido): Consulta SQL a ejecutar

**Ejemplo de uso en Claude:**
```
Usa la conexión minsur-raura y ejecuta:
SELECT TOP 10 * FROM Employees WHERE Department = 'Ventas'
```

**Respuesta incluye:**
- Metadata de la conexión (grupo, descripción, servidor, base de datos)
- Datos resultantes de la consulta
- Número de filas afectadas

---

### 4. get_schema
Obtiene el esquema completo de una tabla o de toda la base de datos.

**Parámetros:**
- `connection` (string, requerido): Nombre de la conexión
- `table` (string, opcional): Nombre de la tabla específica

**Ejemplo de uso en Claude:**
```
Muéstrame el esquema completo de la tabla Employees en la conexión minsur-raura
```

**Retorna:**
- Nombre de columnas
- Tipos de datos
- Longitud máxima de caracteres
- Si acepta nulos
- Valores por defecto

---

### 5. get_indexes
Obtiene información detallada de los índices de una tabla.

**Parámetros:**
- `connection` (string, requerido): Nombre de la conexión
- `table` (string, requerido): Nombre de la tabla

**Ejemplo de uso en Claude:**
```
¿Qué índices tiene la tabla Orders en minsur-sanrafael?
```

**Retorna:**
- Nombre del índice
- Tipo (CLUSTERED, NONCLUSTERED, etc.)
- Columnas incluidas
- Columnas INCLUDE

---

### 6. get_execution_plan
Obtiene el plan de ejecución XML de una consulta para análisis de rendimiento.

**Parámetros:**
- `connection` (string, requerido): Nombre de la conexión
- `sql` (string, requerido): Consulta SQL a analizar

**Ejemplo de uso en Claude:**
```
Analiza el plan de ejecución de esta consulta en minsur-raura:
SELECT o.*, c.CustomerName 
FROM Orders o 
JOIN Customers c ON o.CustomerId = c.Id
WHERE o.OrderDate > '2024-01-01'
```

**Retorna:**
- Plan de ejecución en formato XML
- Información sobre operaciones (scans, seeks, joins)
- Costos estimados
- Missing indexes sugeridos por SQL Server
- Warnings de rendimiento

**Análisis que puedes pedirle a Claude:**
- Identificar table scans y recomendar índices
- Detectar operaciones costosas
- Sugerir optimizaciones de queries
- Comparar planes de ejecución de diferentes versiones de una query

---

### 7. get_stored_procedure
Obtiene la definición completa de un procedimiento almacenado.

**Parámetros:**
- `connection` (string, requerido): Nombre de la conexión
- `name` (string, requerido): Nombre del procedimiento almacenado

**Ejemplo de uso en Claude:**
```
Usa la conexión de Minsur Raura y muéstrame el código del procedimiento sp_CalcularNomina
```

**Retorna:**
- Código completo del procedimiento almacenado
- Parámetros
- Lógica implementada

**Análisis que puedes pedirle a Claude:**
- Revisar y sugerir mejoras al código
- Identificar problemas de rendimiento
- Documentar la lógica del procedimiento
- Detectar posibles bugs o code smells

---

## Formato de respuestas

Todas las herramientas (excepto `list_connections` y `reload_connections`) incluyen metadata completa en sus respuestas:

```json
{
  "metadata": {
    "connection": "minsur-raura",
    "connectionGroup": "Minsur",
    "description": "Base de datos sede Raura",
    "server": "192.168.1.10\\SQLEXPRESS",
    "database": "Minsur_Raura"
  },
  "data": [
    // ... resultados de la consulta
  ],
  "rowsAffected": 10
}
```

Esta metadata te permite:
- Confirmar qué conexión se utilizó
- Identificar el grupo al que pertenece
- Verificar servidor y base de datos consultada
- Tener contexto completo en conversaciones largas

---

## Casos de uso avanzados con Claude

### Ejemplo 1: Análisis y optimización de procedimientos almacenados
```
Usa el MCP de SQL Server de Minsur, con la conexión a su base de datos de Raura, 
y analiza qué mejoras podemos hacer al procedimiento almacenado sp_CalcularHorasExtras.
Revisa el código, identifica posibles problemas de rendimiento y sugiere optimizaciones.
```

### Ejemplo 2: Comparación de esquemas entre sedes
```
Compara el esquema de la tabla Employees entre las conexiones minsur-raura y 
minsur-sanrafael. Identifica diferencias en columnas, tipos de datos e índices.
```

### Ejemplo 3: Análisis de rendimiento de queries
```
En la conexión yanacocha-cajamarca, analiza el plan de ejecución de esta query:
SELECT * FROM Orders WHERE Status = 'Pending' AND OrderDate > '2024-01-01'

Identifica si hay table scans, sugiere índices faltantes y optimizaciones.
```

### Ejemplo 4: Auditoría de índices
```
Usando la conexión minsur-raura, lista todas las tablas que no tienen índices 
o que solo tienen clustered index. Sugiere qué índices adicionales deberíamos crear.
```

### Ejemplo 5: Análisis de dependencias
```
En minsur-sanrafael, identifica qué tablas son referenciadas por la tabla Orders 
a través de foreign keys, y muestra el esquema completo de cada una.
```

### Ejemplo 6: Workflow completo de agregar una conexión
```
1. [Editas connections.json y agregas la nueva conexión]
2. "Recarga las conexiones de SQL Server"
3. "Lista las conexiones disponibles"
4. "Usa la nueva conexión y ejecuta SELECT TOP 5 * FROM SystemInfo"
```

---

## Gestión de conexiones

### Agregar una nueva conexión (Workflow recomendado)

1. Edita el archivo `connections.json`
2. Agrega la nueva conexión al array:

```json
{
  "name": "yanacocha-arequipa",
  "connectionGroup": "Yanacocha",
  "description": "Sede Arequipa - Base de datos operaciones",
  "server": "10.202.82.20",
  "database": "Yanacocha_Arequipa",
  "user": "app_user",
  "password": "secure_password",
  "port": 1433,
  "encrypt": false,
  "trustServerCertificate": true
}
```

3. En Claude, ejecuta: `"Recarga las conexiones de SQL Server"`
4. Verifica con: `"Lista todas las conexiones disponibles"`
5. ¡Listo! La nueva conexión está disponible inmediatamente

### Modificar una conexión existente

1. Edita los campos necesarios en `connections.json`
2. Ejecuta en Claude: `"Recarga las conexiones de SQL Server"`
3. Las conexiones activas se cerrarán y recargarán automáticamente

### Eliminar una conexión

1. Elimina la entrada del array en `connections.json`
2. Ejecuta en Claude: `"Recarga las conexiones de SQL Server"`
3. El pool de conexión se cerrará automáticamente

---

## Solución de problemas

### Error: Connection 'xxx' not found
**Causa:** El nombre de la conexión no existe en `connections.json` o está mal escrito.

**Solución:**
1. Ejecuta `"Lista todas las conexiones disponibles"` para ver los nombres exactos
2. Verifica que el nombre en `connections.json` coincida exactamente (case-sensitive)
3. Si acabas de agregar la conexión, ejecuta `"Recarga las conexiones"`

### Error de conexión a SQL Server
**Posibles causas:**
- Credenciales incorrectas
- Servidor o instancia mal configurada
- Puerto incorrecto
- Firewall bloqueando la conexión
- SQL Server no permite conexiones remotas

**Diagnóstico:**
1. Verifica credenciales (server, user, password, database)
2. Prueba conectividad: `ping [servidor]` y `telnet [servidor] [puerto]`
3. Verifica que SQL Server permita autenticación SQL Server (no solo Windows)
4. Revisa logs de SQL Server para más detalles
5. Verifica que el usuario tenga permisos en la base de datos

### Claude no encuentra el MCP
**Solución:**
1. Verifica la ruta absoluta en `claude_desktop_config.json`
2. Asegúrate de que `node` esté instalado y en tu PATH
3. Reinicia Claude Desktop completamente (cierra todas las ventanas)
4. Revisa que el archivo `index.js` exista en la ruta especificada
5. Prueba ejecutar manualmente: `node C:\mcp-sqlserver\index.js`

### Error al recargar conexiones
**Causa:** Archivo `connections.json` con formato JSON inválido.

**Solución:**
1. Valida el JSON en https://jsonlint.com/
2. Verifica que todas las comas estén correctas
3. Verifica que no falten o sobren llaves `{}`
4. Verifica que todas las cadenas estén entre comillas dobles `"`

### Pool de conexión no se cierra
**Solución:**
- El comando `reload_connections` cierra automáticamente todos los pools
- Si persiste el problema, reinicia Claude Desktop

---

## Seguridad

⚠️ **Importante**: El archivo `connections.json` contiene contraseñas en texto plano. 

### Recomendaciones de seguridad:

1. **Control de versiones:**
   - ❌ **NO subas** `connections.json` a repositorios públicos
   - ✅ Agrega `connections.json` a tu `.gitignore`
   - ✅ Usa un archivo `connections.template.json` con valores de ejemplo

2. **Permisos de archivo:**
   - Restringe permisos de lectura solo al usuario necesario
   - En Windows: `icacls connections.json /inheritance:r /grant:r "%USERNAME%:F"`
   - En Linux/Mac: `chmod 600 connections.json`

3. **Credenciales:**
   - Usa usuarios de SQL Server con permisos mínimos necesarios
   - No uses cuentas `sa` en producción
   - Considera usar autenticación integrada de Windows cuando sea posible
   - Rota passwords periódicamente

4. **Producción:**
   - Considera usar Azure Key Vault o similar para secretos
   - Implementa variables de entorno en lugar de texto plano
   - Usa conexiones encriptadas (`encrypt: true`)

### Ejemplo de .gitignore

```gitignore
# MCP SQL Server
connections.json
node_modules/
*.log
```

---

## Migración desde versión 1.0

Si venías usando la versión anterior con múltiples entradas en `claude_desktop_config.json`:

### Paso 1: Crear connections.json
Convierte tus conexiones del formato antiguo:

**Formato antiguo (claude_desktop_config.json):**
```json
{
  "mcpServers": {
    "sqlserver-minsur-raura": {
      "command": "node",
      "args": ["C:\\mcp-sqlserver\\index.js"],
      "env": {
        "SQL_SERVER": "192.168.1.10\\SQLEXPRESS",
        "SQL_DATABASE": "Minsur_Raura",
        ...
      }
    }
  }
}
```

**Formato nuevo (connections.json):**
```json
{
  "connections": [
    {
      "name": "minsur-raura",
      "connectionGroup": "Minsur",
      "description": "Base de datos sede Raura",
      "server": "192.168.1.10\\SQLEXPRESS",
      "database": "Minsur_Raura",
      ...
    }
  ]
}
```

### Paso 2: Actualizar claude_desktop_config.json
Reemplaza todas las entradas `sqlserver-xxx` con una única entrada:

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "node",
      "args": ["C:\\mcp-sqlserver\\index.js"]
    }
  }
}
```

### Paso 3: Reiniciar Claude Desktop
Cierra completamente Claude Desktop y vuelve a abrirlo.

### Paso 4: Verificar
Ejecuta en Claude: `"Lista todas las conexiones SQL Server disponibles"`

---

## Desarrollo y pruebas

### Estructura del proyecto

```
mcp-sqlserver/
├── index.js                      # Servidor MCP principal
├── connections.json              # Configuración de conexiones
├── connections.template.json     # Template de ejemplo
├── package.json                  # Dependencias npm
├── README.md                     # Este archivo
├── CHANGELOG.md                  # Historial de cambios
└── .gitignore                    # Archivos a ignorar en git
```

### Ejecutar pruebas manuales

```bash
# Verificar sintaxis
node index.js

# Ver logs en Claude Desktop
# Windows: %APPDATA%\Claude\logs
# Mac: ~/Library/Logs/Claude
# Linux: ~/.config/Claude/logs
```

### Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Roadmap

### Versión 2.1 (Planeada)
- [ ] Soporte para autenticación integrada de Windows
- [ ] Exportar resultados a CSV/Excel
- [ ] Backup de esquemas de base de datos
- [ ] Comparación automática de esquemas entre conexiones

### Versión 3.0 (Futuro)
- [ ] Soporte para Azure SQL Database
- [ ] Integración con variables de entorno
- [ ] Interfaz web para gestión de conexiones
- [ ] Métricas y monitoreo de uso

---

## Licencia

ISC

---

## Autor

Christian V. - @cvelasquez

### Contacto y Soporte

- **Issues:** [GitHub Issues](https://github.com/cvelasquez/mcp-sqlserver/issues)
- **Documentación:** [Wiki del proyecto](https://github.com/cvelasquez/mcp-sqlserver/wiki)

---

## Changelog

### v2.0.0 (2026-01-01)
- ✨ **NUEVO:** Comando `reload_connections` para recargar configuración sin reiniciar
- ✨ **NUEVO:** Campo `connectionGroup` para agrupar conexiones por cliente
- ✨ **NUEVO:** Campo `description` para identificar propósito de cada conexión
- ✨ **NUEVO:** Comando `get_execution_plan` para análisis de rendimiento
- ✨ **NUEVO:** Metadata incluida en todas las respuestas
- 🔧 Archivo `connections.json` centralizado
- 🔧 Pool de conexiones optimizado
- 📝 Documentación completa actualizada

### v1.0.0 (2025-12-15)
- 🎉 Release inicial
- ✅ Comandos básicos: query, get_schema, get_indexes, get_stored_procedure
- ✅ Soporte para múltiples conexiones

---

**¿Listo para empezar?** 🚀

1. Configura tu `connections.json`
2. Actualiza `claude_desktop_config.json`  
3. Reinicia Claude Desktop
4. Ejecuta: `"Lista todas las conexiones SQL Server disponibles"`
5. ¡Disfruta trabajando con SQL Server desde Claude!
