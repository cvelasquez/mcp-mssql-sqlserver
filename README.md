# MCP SQL Server

Servidor MCP (Model Context Protocol) para conectar Claude Desktop y Claude Code con Microsoft SQL Server.

## 🎯 Características

- ✅ Ejecutar queries SQL
- ✅ Obtener schema de tablas
- ✅ Ver índices
- ✅ Analizar planes de ejecución
- ✅ Ver definición de stored procedures
- ✅ Optimización de performance

## 📋 Pre-requisitos

- Node.js v18 o superior
- SQL Server (cualquier versión)
- TCPIP habilitado en SQL Server
- Claude Desktop o Claude Code

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone httpsgithub.comtu-usuariomcp-sqlserver.git
cd mcp-sqlserver
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Instalar globalmente

```bash
npm link
```

## ⚙️ Configuración

### Habilitar TCPIP en SQL Server

1. Abre SQL Server Configuration Manager
2. Ve a SQL Server Network Configuration → Protocols for [tu instancia]
3. Click derecho en TCPIP → Enable
4. Reinicia el servicio de SQL Server

### Para Claude Desktop

Windows
Edita `CUsersTU_USUARIOAppDataRoamingClaudeclaude_desktop_config.json`

macOSLinux
Edita `~.configClaudeclaude_desktop_config.json`

```json
{
  mcpServers {
    sqlserver {
      command node,
      args [RUTA_COMPLETAmcp-sqlserverindex.js],
      env {
        MSSQL_SERVER localhost,
        MSSQL_DATABASE TuBaseDeDatos,
        MSSQL_USER tu_usuario,
        MSSQL_PASSWORD tu_password,
        MSSQL_PORT 1433,
        MSSQL_ENCRYPT false,
        MSSQL_TRUST_CERT true
      }
    }
  }
}
```

Importante Windows Usa doble backslash `` en las rutas.

### Para Claude Code

⚠️ IMPORTANTE No edites manualmente el archivo `.claude.json` ya que contiene información crítica que puede dañarse.

Método recomendado

1. Abre Claude Code en tu terminal
2. Pídele directamente que añada la configuración del MCP

```
Añade esta configuración de MCP al archivo .claude.json

{
  mcpServers {
    sqlserver {
      command node,
      args [Cmcp-sqlserverindex.js],
      env {
        MSSQL_SERVER localhost,
        MSSQL_DATABASE TuBaseDeDatos,
        MSSQL_USER tu_usuario,
        MSSQL_PASSWORD tu_password,
        MSSQL_PORT 1433,
        MSSQL_ENCRYPT false,
        MSSQL_TRUST_CERT true
      }
    }
  }
}

```

3. Claude Code lo añadirá de forma segura sin dañar la configuración existente
4. Cierra y vuelve a abrir la terminal para que cargue los cambios

## 🔧 Configuración de Variables de Entorno

 Variable  Descripción  Ejemplo 
--------------------------------
 `MSSQL_SERVER`  Servidor SQL  `localhost` o `localhostSQLEXPRESS` 
 `MSSQL_DATABASE`  Base de datos  `MiBaseDatos` 
 `MSSQL_USER`  Usuario  `sa` 
 `MSSQL_PASSWORD`  Contraseña  `tuPassword` 
 `MSSQL_PORT`  Puerto  `1433` 
 `MSSQL_ENCRYPT`  Encriptar conexión  `false` o `true` 
 `MSSQL_TRUST_CERT`  Confiar en certificado  `true` o `false` 

## 🛠️ Herramientas Disponibles

Una vez configurado, Claude tendrá acceso a estas herramientas

### `query`
Ejecuta cualquier query SQL
```sql
SELECT  FROM Employees WHERE Department = 'IT'
```

### `get_schema`
Obtiene el schema de una tabla específica o todas
```
get_schema(table Employees)
```

### `get_indexes`
Muestra todos los índices de una tabla
```
get_indexes(table Employees)
```

### `get_execution_plan`
Analiza el plan de ejecución de un query
```
get_execution_plan(sql SELECT  FROM Orders WHERE OrderDate  '2024-01-01')
```

### `get_stored_procedure`
Obtiene la definición completa de un stored procedure
```
get_stored_procedure(name sp_GetEmployeesByDepartment)
```

## 📝 Uso en Claude

Después de la configuración, simplemente pregúntale a Claude

```
Muéstrame el schema de la tabla Employees
Analiza el performance del stored procedure sp_ProcessOrders
¿Qué índices tiene la tabla Orders
Ejecuta un query para ver los últimos 10 pedidos
```

## ✅ Verificar Instalación

1. Reinicia Claude Desktop o Claude Code completamente
2. Pregunta a Claude
   ```
   Comprueba el acceso a SQL Server
   ```
3. Claude ejecutará un query de prueba

## 🐛 Troubleshooting

### Error Could not connect
- Verifica que SQL Server esté corriendo
- Confirma que TCPIP esté habilitado
- Revisa usuario y contraseña
- Verifica el puerto (por defecto 1433)

### Error Login failed
- Confirma las credenciales en el archivo de configuración
- Verifica que el usuario tenga permisos en la base de datos

### Claude no reconoce las herramientas
- Cierra completamente Claude Desktop (incluso del system tray)
- Verifica que la ruta en `args` sea correcta
- Revisa que el archivo de configuración tenga sintaxis JSON válida

### Windows Instancia nombrada
Si usas `SQLEXPRESS` u otra instancia nombrada
```json
MSSQL_SERVER localhostSQLEXPRESS
```

## 📦 Estructura del Proyecto

```
mcp-sqlserver
├── index.js           # Servidor MCP principal
├── package.json       # Dependencias y configuración
├── README.md          # Este archivo
└── node_modules      # Dependencias instaladas
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b featuremejora`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin featuremejora`)
5. Abre un Pull Request

## 📄 Licencia

ISC License

## 👤 Autor

Christian V. - [@cvelasquez](https://github.com/cvelasquez)

## 🙏 Agradecimientos

- [Model Context Protocol SDK](https://github.com/modelcontextprotocolsdk)
- [node-mssql](https://github.com/tediousjsnode-mssql)
- Anthropic Claude Team