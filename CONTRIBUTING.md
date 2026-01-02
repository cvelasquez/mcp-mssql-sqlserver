# Contribuyendo a MCP SQL Server

¡Gracias por tu interés en contribuir al proyecto MCP SQL Server! 🎉

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamientos inaceptables.

## ¿Cómo puedo contribuir?

### Reportar Bugs

Si encuentras un bug, por favor crea un issue con:

- **Título descriptivo**: Resume el problema en pocas palabras
- **Pasos para reproducir**: Lista los pasos exactos para reproducir el bug
- **Comportamiento esperado**: Describe qué esperabas que sucediera
- **Comportamiento actual**: Describe qué sucedió en realidad
- **Versión**: Indica la versión del MCP que estás usando
- **Ambiente**: Sistema operativo, versión de Node.js, versión de SQL Server
- **Logs**: Si es posible, incluye logs relevantes

**Ejemplo:**

```
Título: Error al conectar con instancia nombrada de SQL Server

Pasos para reproducir:
1. Configurar conexión con server: "192.168.1.10\SQLEXPRESS"
2. Ejecutar reload_connections
3. Intentar ejecutar query

Comportamiento esperado:
La query debería ejecutarse correctamente

Comportamiento actual:
Error: Connection timeout

Versión: 2.0.0
Ambiente: Windows 11, Node.js 18.0.0, SQL Server 2019
```

### Sugerir Mejoras

Las sugerencias de nuevas características son bienvenidas. Por favor:

1. Verifica que la característica no exista ya
2. Explica claramente el problema que resuelve
3. Proporciona ejemplos de uso
4. Considera alternativas que hayas evaluado

### Pull Requests

1. **Fork el repositorio** y crea tu rama desde `main`
2. **Nombre de la rama**: Usa un nombre descriptivo
   - `feature/nombre-caracteristica` para nuevas características
   - `fix/descripcion-bug` para correcciones
   - `docs/que-se-actualiza` para documentación
3. **Haz tus cambios**
4. **Prueba tus cambios** exhaustivamente
5. **Actualiza la documentación** si es necesario
6. **Commit** con mensajes descriptivos
7. **Push** a tu fork
8. **Crea el Pull Request**

#### Estilo de Commits

Usamos commits convencionales:

```
tipo(scope): descripción corta

Descripción más detallada si es necesaria

Closes #123
```

**Tipos:**
- `feat`: Nueva característica
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan funcionalidad)
- `refactor`: Refactorización de código
- `test`: Añadir o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```
feat(reload): add reload_connections command

Implements hot-reload functionality to update connections
without restarting Claude Desktop.

Closes #45
```

```
fix(execution-plan): correct XML plan extraction

Fixed bug where execution plan returned query results
instead of the actual XML plan.

Closes #67
```

### Proceso de Revisión

1. Un mantenedor revisará tu PR
2. Pueden solicitar cambios o hacer preguntas
3. Una vez aprobado, se hará merge a `main`
4. Tu contribución será incluida en el próximo release

## Guías de Desarrollo

### Configuración del Ambiente

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/mcp-sqlserver.git
cd mcp-sqlserver

# Instalar dependencias
npm install

# Copiar template de conexiones
cp connections.template.json connections.json

# Editar con tus conexiones de prueba
# (No subir este archivo al repo)
```

### Estructura del Proyecto

```
mcp-sqlserver/
├── index.js                      # Servidor MCP principal
├── connections.json              # Configuración (NO subir)
├── connections.template.json     # Template de ejemplo
├── package.json                  # Dependencias
├── README.md                     # Documentación principal
├── CHANGELOG.md                  # Historial de cambios
├── CONTRIBUTING.md               # Esta guía
├── LICENSE                       # Licencia ISC
└── .gitignore                    # Archivos ignorados
```

### Estándares de Código

- **JavaScript moderno**: Usa ES6+ features
- **Async/Await**: Preferir sobre callbacks
- **Nombres descriptivos**: Variables y funciones con nombres claros
- **Comentarios**: Solo cuando el código no sea auto-explicativo
- **Error handling**: Siempre usar try/catch en operaciones async
- **Validación**: Validar inputs antes de usarlos

### Testing

Antes de enviar un PR, asegúrate de probar:

1. **Comandos básicos**: list_connections, reload_connections
2. **Queries**: Ejecutar queries simples y complejas
3. **Error handling**: Probar con conexiones inválidas
4. **Edge cases**: Situaciones límite o inusuales

### Documentación

Si tu contribución:
- Agrega nueva funcionalidad → Actualiza README.md
- Cambia comportamiento existente → Actualiza README.md y CHANGELOG.md
- Corrige un bug → Actualiza CHANGELOG.md

## Áreas que Necesitan Ayuda

Estas son áreas donde apreciamos especialmente contribuciones:

### Features Planeados (v2.1)
- [ ] Autenticación integrada de Windows
- [ ] Exportar resultados a CSV/Excel
- [ ] Backup de esquemas
- [ ] Comparación automática de esquemas

### Mejoras de Documentación
- [ ] Video tutorial de configuración
- [ ] Ejemplos de uso por industria
- [ ] Troubleshooting avanzado
- [ ] Traducción a otros idiomas

### Testing
- [ ] Suite de tests automatizados
- [ ] Tests de integración
- [ ] Tests de rendimiento

### Performance
- [ ] Optimización de queries grandes
- [ ] Cache de resultados
- [ ] Paralelización de operaciones

## Preguntas

Si tienes preguntas sobre cómo contribuir:

1. Revisa los [issues existentes](https://github.com/tu-usuario/mcp-sqlserver/issues)
2. Busca en [discusiones](https://github.com/tu-usuario/mcp-sqlserver/discussions)
3. Crea un nuevo issue con la etiqueta `question`

## Reconocimiento

Todos los contribuidores serán agregados al README.md en la sección de Contributors.

## Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la licencia ISC del proyecto.

---

¡Gracias por hacer de MCP SQL Server un mejor proyecto! 🚀
