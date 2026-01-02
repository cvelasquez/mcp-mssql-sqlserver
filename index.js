#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import sql from "mssql";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar conexiones desde el archivo JSON
const connectionsPath = join(__dirname, "connections.json");
let connections = [];

// Función para cargar/recargar conexiones
function loadConnections() {
  const connectionsData = JSON.parse(readFileSync(connectionsPath, "utf-8"));
  connections = connectionsData.connections;
  return connections.length;
}

// Cargar conexiones al iniciar
loadConnections();

// Mantener pool de conexiones activas
const connectionPools = new Map();

// Función para obtener o crear pool de conexión
async function getConnectionPool(connectionName) {
  if (connectionPools.has(connectionName)) {
    return connectionPools.get(connectionName);
  }

  const connConfig = connections.find((c) => c.name === connectionName);
  if (!connConfig) {
    throw new Error(`Connection '${connectionName}' not found`);
  }

  const config = {
    server: connConfig.server,
    database: connConfig.database,
    user: connConfig.user,
    password: connConfig.password,
    options: {
      encrypt: connConfig.encrypt,
      trustServerCertificate: connConfig.trustServerCertificate,
    },
    port: connConfig.port,
  };

  const pool = await sql.connect(config);
  connectionPools.set(connectionName, pool);
  return pool;
}

const server = new Server(
  {
    name: "mssql-server",
    version: "2.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_connections",
        description: "List all available SQL Server connections grouped by connectionGroup",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "reload_connections",
        description: "Reload connections from connections.json file without restarting the MCP server. Closes existing connection pools and loads new configuration.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "query",
        description: "Execute a SQL query on the database",
        inputSchema: {
          type: "object",
          properties: {
            connection: {
              type: "string",
              description: "Connection name to use",
            },
            sql: {
              type: "string",
              description: "SQL query to execute",
            },
          },
          required: ["connection", "sql"],
        },
      },
      {
        name: "get_schema",
        description: "Get database schema information for specific tables",
        inputSchema: {
          type: "object",
          properties: {
            connection: {
              type: "string",
              description: "Connection name to use",
            },
            table: {
              type: "string",
              description: "Table name (optional, returns all if not specified)",
            },
          },
          required: ["connection"],
        },
      },
      {
        name: "get_indexes",
        description: "Get index information for a table",
        inputSchema: {
          type: "object",
          properties: {
            connection: {
              type: "string",
              description: "Connection name to use",
            },
            table: {
              type: "string",
              description: "Table name",
            },
          },
          required: ["connection", "table"],
        },
      },
      {
        name: "get_execution_plan",
        description: "Get execution plan for a query",
        inputSchema: {
          type: "object",
          properties: {
            connection: {
              type: "string",
              description: "Connection name to use",
            },
            sql: {
              type: "string",
              description: "SQL query to analyze",
            },
          },
          required: ["connection", "sql"],
        },
      },
      {
        name: "get_stored_procedure",
        description: "Get stored procedure definition",
        inputSchema: {
          type: "object",
          properties: {
            connection: {
              type: "string",
              description: "Connection name to use",
            },
            name: {
              type: "string",
              description: "Stored procedure name",
            },
          },
          required: ["connection", "name"],
        },
      },
    ],
  };
});

// Handler para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Comando list_connections
    if (name === "list_connections") {
      const grouped = {};
      
      connections.forEach((conn) => {
        if (!grouped[conn.connectionGroup]) {
          grouped[conn.connectionGroup] = [];
        }
        grouped[conn.connectionGroup].push({
          name: conn.name,
          description: conn.description,
          server: conn.server,
          database: conn.database,
        });
      });

      let output = "Available SQL Server Connections:\n\n";
      
      for (const [group, conns] of Object.entries(grouped)) {
        output += `${group}:\n`;
        conns.forEach((conn) => {
          output += `  - ${conn.name}\n`;
          output += `    Description: ${conn.description}\n`;
          output += `    Server: ${conn.server}\n`;
          output += `    Database: ${conn.database}\n\n`;
        });
      }

      return {
        content: [
          {
            type: "text",
            text: output,
          },
        ],
      };
    }

    // Comando reload_connections
    if (name === "reload_connections") {
      try {
        // Cerrar todos los pools de conexión existentes
        const closedPools = [];
        for (const [connName, pool] of connectionPools.entries()) {
          try {
            await pool.close();
            closedPools.push(connName);
          } catch (err) {
            // Ignorar errores al cerrar pools
          }
        }
        connectionPools.clear();

        // Recargar configuración
        const count = loadConnections();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  message: "Connections reloaded successfully",
                  totalConnections: count,
                  closedPools: closedPools.length,
                  connectionNames: connections.map(c => c.name),
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: error.message,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    }

    // Validar que se proporcione el parámetro connection
    if (!args.connection) {
      throw new Error("Connection parameter is required");
    }

    // Obtener información de la conexión para metadata
    const connConfig = connections.find((c) => c.name === args.connection);
    if (!connConfig) {
      throw new Error(`Connection '${args.connection}' not found`);
    }

    const metadata = {
      connection: args.connection,
      connectionGroup: connConfig.connectionGroup,
      description: connConfig.description,
      server: connConfig.server,
      database: connConfig.database,
    };

    // Obtener pool de conexión
    const pool = await getConnectionPool(args.connection);

    switch (name) {
      case "query": {
        const result = await pool.query(args.sql);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  metadata,
                  data: result.recordset,
                  rowsAffected: result.rowsAffected[0],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_schema": {
        const query = args.table
          ? `
            SELECT 
              c.TABLE_NAME,
              c.COLUMN_NAME,
              c.DATA_TYPE,
              c.CHARACTER_MAXIMUM_LENGTH,
              c.IS_NULLABLE,
              c.COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS c
            WHERE c.TABLE_NAME = '${args.table}'
            ORDER BY c.ORDINAL_POSITION
          `
          : `
            SELECT 
              c.TABLE_NAME,
              c.COLUMN_NAME,
              c.DATA_TYPE,
              c.CHARACTER_MAXIMUM_LENGTH,
              c.IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS c
            ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION
          `;

        const result = await pool.query(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  metadata,
                  schema: result.recordset,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_indexes": {
        const query = `
          SELECT 
            i.name AS IndexName,
            i.type_desc AS IndexType,
            COL_NAME(ic.object_id, ic.column_id) AS ColumnName,
            ic.is_included_column AS IsIncluded
          FROM sys.indexes i
          INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
          WHERE OBJECT_NAME(i.object_id) = '${args.table}'
          ORDER BY i.name, ic.key_ordinal
        `;

        const result = await pool.query(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  metadata,
                  indexes: result.recordset,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_execution_plan": {
        try {
          // Crear un request único para mantener la sesión
          const request = pool.request();
          
          // Activar SHOWPLAN_XML (debe ser la única sentencia en el batch)
          await request.batch("SET SHOWPLAN_XML ON");
          
          // Ejecutar la consulta para obtener el plan (no ejecuta la query, solo devuelve el plan)
          const planResult = await request.batch(args.sql);
          
          // Desactivar SHOWPLAN_XML
          await request.batch("SET SHOWPLAN_XML OFF");
          
          // El plan XML viene en el recordsets
          let planXml = null;
          if (planResult.recordsets && planResult.recordsets.length > 0) {
            const planRecordset = planResult.recordsets[0];
            if (planRecordset && planRecordset.length > 0) {
              const firstRow = planRecordset[0];
              // Intentar diferentes nombres de columna comunes
              planXml = firstRow['Microsoft SQL Server 2005 XML Showplan'] || 
                       firstRow['QUERY PLAN'] ||
                       firstRow[Object.keys(firstRow)[0]];
            }
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    metadata,
                    query: args.sql,
                    executionPlanXml: planXml
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          // Asegurarse de desactivar SHOWPLAN_XML en caso de error
          try {
            await pool.request().batch("SET SHOWPLAN_XML OFF");
          } catch (e) {
            // Ignorar errores al desactivar
          }
          throw error;
        }
      }

      case "get_stored_procedure": {
        const query = `
          SELECT OBJECT_DEFINITION(OBJECT_ID('${args.name}')) AS Definition
        `;

        const result = await pool.query(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  metadata,
                  storedProcedure: args.name,
                  definition: result.recordset[0]?.Definition || "Stored procedure not found",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SQL Server MCP Server v2.0 running on stdio");
  console.error(`Loaded ${connections.length} connections from ${connectionsPath}`);
}

runServer().catch(console.error);
