# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.0.0] - 2026-01-01

### 🎉 Cambios Mayores

- **Gestión centralizada de conexiones**: Todas las conexiones ahora se definen en un único archivo `connections.json`
- **Configuración simplificada**: Solo se necesita una entrada en `claude_desktop_config.json` para todas las conexiones
- **Agrupación de conexiones**: Nuevo campo `connectionGroup` para organizar conexiones por cliente/proyecto/ambiente
- **Descripciones detalladas**: Nuevo campo `description` para identificar el propósito, sede o ambiente de cada conexión

### ✨ Nuevas Características

#### Comandos Nuevos
- **`list_connections`**: Lista todas las conexiones disponibles agrupadas por `connectionGroup`
- **`reload_connections`**: Recarga el archivo `connections.json` sin necesidad de reiniciar Claude Desktop
  - Cierra automáticamente pools de conexión obsoletos
  - Carga nueva configuración en caliente
  - Retorna información detallada del proceso (conexiones cargadas, pools cerrados)

#### Mejoras en Comandos Existentes
- **Metadata en todas las respuestas**: Todos los comandos ahora incluyen información completa de la conexión utilizada:
  - `connection`: Nombre de la conexión
  - `connectionGroup`: Grupo al que pertenece
  - `description`: Descripción detallada
  - `server`: Servidor SQL Server
  - `database`: Base de datos

- **`get_execution_plan`**: Corregido bug crítico
  - Ahora retorna correctamente el plan de ejecución en formato XML
  - Incluye información detallada de costos
  - Detecta y reporta missing indexes sugeridos por SQL Server
  - Permite análisis profundo de rendimiento de queries

### 🔧 Mejoras Técnicas

- **Pool de conexiones optimizado**: Reutilización eficiente de conexiones activas para mejor rendimiento
- **Función `loadConnections()`**: Permite recargar conexiones dinámicamente
- **Gestión automática de pools**: Cierre inteligente de conexiones obsoletas al recargar
- **Mejor manejo de errores**: Mensajes más descriptivos y contextuales
- **Validación de configuración**: Verifica existencia de conexiones antes de usarlas

### 📝 Cambios en la API

#### BREAKING CHANGES

Todas las herramientas ahora requieren el parámetro `connection` para identificar qué conexión usar:

**Antes (v1.0):**
```javascript
query({ sql: "SELECT * FROM Users" })
```

**Ahora (v2.0):**
```javascript
query({ 
  connection: "minsur-raura",
  sql: "SELECT * FROM Users" 
})
```

#### Formato de Respuestas

Todas las respuestas (excepto `list_connections` y `reload_connections`) ahora incluyen metadata:

```json
{
  "metadata": {
    "connection": "minsur-raura",
    "connectionGroup": "Minsur",
    "description": "Base de datos sede Raura",
    "server": "192.168.1.10\\SQLEXPRESS",
    "database": "Minsur_Raura"
  },
  "data": [...],
  "rowsAffected": 10
}
```

### 🔒 Seguridad

- Documentación completa de mejores prácticas de seguridad en README.md
- Recomendaciones sobre manejo de credenciales sensibles
- Plantilla `.gitignore` actualizada para proteger `connections.json`
- Advertencias sobre no subir credenciales a repositorios públicos
- Sugerencias de permisos de archivo en diferentes sistemas operativos

### 📚 Documentación

- **README.md completamente reescrito** con:
  - Documentación detallada de todos los comandos
  - Ejemplos de uso avanzados con Claude
  - Casos de uso reales por industria
  - Guía completa de solución de problemas
  - Instrucciones de migración desde v1.0
  - Roadmap de futuras versiones

- **CHANGELOG.md actualizado** con:
  - Historial completo de cambios
  - Formato estandarizado basado en Keep a Changelog
  - Secciones claras por tipo de cambio

- **Archivos de ejemplo actualizados**:
  - `connections.template.json`: Template de configuración
  - `claude_desktop_config_example.json`: Ejemplo de configuración simplificada

### 🧪 Testing

Durante el desarrollo se realizaron pruebas exhaustivas:

#### Pruebas Básicas (✅ Completadas)
1. Listar todas las tablas (529 tablas detectadas)
2. Obtener esquema de tabla específica (107 columnas)
3. Ejecutar SELECT con filtros
4. Verificar índices de tabla

#### Pruebas de Performance (✅ Completadas)
5. Plan de ejecución con filtro simple (bug detectado y corregido)
6. Plan de ejecución con COUNT (Missing Index detectado - Impact 98.21%)
7. Plan de ejecución con JOINs complejos (Missing Index detectado - Impact 88.97%)

#### Pruebas de Stored Procedures (✅ Completadas)
8. Listar stored procedures disponibles (20+ SPs)
9. Obtener definición de SP simple
10. Obtener definición de SP complejo
11. Manejo de SP inexistente

#### Pruebas de Dependencias (✅ Completadas)
12. Identificar dependencias SP → Tabla
13. Identificar dependencias entre SPs

#### Pruebas de Metadata (✅ Completadas)
14. Verificar metadata en todas las respuestas
15. Validar información de conexión en diferentes tipos de consultas

#### Pruebas de Análisis (✅ Completadas)
16. Analizar estructura de tablas relacionadas - 61 Foreign Keys encontradas
17. Detectar tablas sin índices - 112 heap tables detectadas
18. Sugerir optimizaciones de esquema

#### Pruebas de Reload (✅ Completadas)
19. Agregar nueva conexión y recargar sin reiniciar
20. Modificar conexión existente y recargar
21. Eliminar conexión y verificar cierre de pools

### 📋 Migración desde v1.0

#### Paso 1: Crear connections.json

Convierte cada entrada de `claude_desktop_config.json` a una entrada en `connections.json`:

**Formato antiguo:**
```json
{
  "mcpServers": {
    "sqlserver-minsur-raura": {
      "command": "node",
      "args": ["C:\\mcp-sqlserver\\index.js"],
      "env": {
        "SQL_SERVER": "192.168.1.10\\SQLEXPRESS",
        "SQL_DATABASE": "Minsur_Raura",
        "SQL_USER": "sa",
        "SQL_PASSWORD": "password",
        "SQL_PORT": "1433"
      }
    }
  }
}
```

**Formato nuevo:**
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
      "password": "password",
      "port": 1433,
      "encrypt": false,
      "trustServerCertificate": true
    }
  ]
}
```

#### Paso 2: Simplificar claude_desktop_config.json

Elimina todas las entradas `sqlserver-xxx` y deja una única entrada:

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

#### Paso 3: Reiniciar y Verificar

1. Cierra completamente Claude Desktop
2. Vuelve a abrir Claude Desktop
3. Ejecuta: `"Lista todas las conexiones SQL Server disponibles"`
4. Verifica que todas tus conexiones aparezcan correctamente

### 🐛 Bugs Corregidos

- **get_execution_plan**: Corregido bug crítico donde devolvía resultados de la query en lugar del plan XML
  - Problema: Usaba múltiples `pool.request()` que no compartían la misma sesión
  - Solución: Usar un único objeto `request` para todos los comandos batch
  - Resultado: Ahora retorna correctamente el plan de ejecución en formato XML con toda la información de análisis

### ⚠️ Deprecaciones

- **Variables de entorno para configuración**: Ya no se usan variables de entorno en `claude_desktop_config.json`
- **Múltiples entradas en claude_desktop_config.json**: Ahora solo se necesita una entrada

---

## [1.0.0] - 2025-12-15

### 🎉 Release Inicial

#### Características Principales

- Conexión a SQL Server usando Node.js y mssql
- Configuración mediante variables de entorno en `claude_desktop_config.json`
- Una entrada por conexión en el archivo de configuración

#### Herramientas Implementadas

1. **query**: Ejecuta consultas SQL
2. **get_schema**: Obtiene esquema de tablas
3. **get_indexes**: Lista índices de tablas
4. **get_execution_plan**: Obtiene plan de ejecución (con bug)
5. **get_stored_procedure**: Obtiene definición de stored procedures

#### Limitaciones de v1.0

- Configuración verbosa (una entrada por conexión)
- Sin agrupación de conexiones
- Sin metadata en respuestas
- Sin capacidad de recarga en caliente
- Bug en `get_execution_plan` que devuelve resultados en lugar del plan XML

---

## Tipos de Cambios

- ✨ **Nuevas características**: Nueva funcionalidad añadida
- 🔧 **Mejoras**: Cambios en funcionalidad existente
- 🐛 **Bugs corregidos**: Corrección de bugs
- 🔒 **Seguridad**: Cambios relacionados con seguridad
- 📝 **Documentación**: Solo cambios en documentación
- 🎨 **Estilo**: Cambios que no afectan el significado del código
- ♻️ **Refactorización**: Cambios de código que no corrigen bugs ni añaden características
- ⚡ **Performance**: Cambios que mejoran el rendimiento
- 🧪 **Testing**: Añadir o corregir tests
- 🔨 **Build**: Cambios en el sistema de build o dependencias externas
- ⚠️ **Breaking Changes**: Cambios incompatibles con versiones anteriores
- 🗑️ **Deprecaciones**: Características marcadas como obsoletas

---

## [Unreleased]

### Planeado para v2.1.0

- [ ] Soporte para autenticación integrada de Windows
- [ ] Exportar resultados de queries a CSV/Excel
- [ ] Backup automático de esquemas de base de datos
- [ ] Comando para comparar esquemas entre dos conexiones
- [ ] Soporte para transacciones explícitas
- [ ] Historial de queries ejecutadas

### Considerando para v3.0.0

- [ ] Soporte para Azure SQL Database
- [ ] Integración con Azure Key Vault para credenciales
- [ ] Interfaz web para gestión de conexiones
- [ ] Métricas y monitoreo de uso del MCP
- [ ] Soporte para otros tipos de bases de datos (PostgreSQL, MySQL)
- [ ] Cache de resultados de queries frecuentes
- [ ] Sistema de plugins para extensiones personalizadas

---

**¿Encontraste un bug o tienes una sugerencia?**  
Abre un issue en [GitHub Issues](https://github.com/tu-usuario/mcp-sqlserver/issues)
