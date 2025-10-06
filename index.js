#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import sql from "mssql";

const config = {
  server: process.env.MSSQL_SERVER || "localhost",
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === "true",
    trustServerCertificate: process.env.MSSQL_TRUST_CERT === "true",
  },
  port: parseInt(process.env.MSSQL_PORT || "1433"),
};

const server = new Server(
  {
    name: "mssql-server",
    version: "1.0.0",
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
        name: "query",
        description: "Execute a SQL query on the database",
        inputSchema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
              description: "SQL query to execute",
            },
          },
          required: ["sql"],
        },
      },
      {
        name: "get_schema",
        description: "Get database schema information for specific tables",
        inputSchema: {
          type: "object",
          properties: {
            table: {
              type: "string",
              description: "Table name (optional, returns all if not specified)",
            },
          },
        },
      },
      {
        name: "get_indexes",
        description: "Get index information for a table",
        inputSchema: {
          type: "object",
          properties: {
            table: {
              type: "string",
              description: "Table name",
            },
          },
          required: ["table"],
        },
      },
      {
        name: "get_execution_plan",
        description: "Get execution plan for a query",
        inputSchema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
              description: "SQL query to analyze",
            },
          },
          required: ["sql"],
        },
      },
      {
        name: "get_stored_procedure",
        description: "Get stored procedure definition",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Stored procedure name",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

// Handler para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    await sql.connect(config);

    switch (name) {
      case "query": {
        const result = await sql.query(args.sql);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.recordset, null, 2),
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

        const result = await sql.query(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.recordset, null, 2),
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

        const result = await sql.query(query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.recordset, null, 2),
            },
          ],
        };
      }

      case "get_execution_plan": {
        await sql.query("SET SHOWPLAN_XML ON");
        const result = await sql.query(args.sql);
        await sql.query("SET SHOWPLAN_XML OFF");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.recordset, null, 2),
            },
          ],
        };
      }

      case "get_stored_procedure": {
        const query = `
          SELECT OBJECT_DEFINITION(OBJECT_ID('${args.name}')) AS Definition
        `;

        const result = await sql.query(query);
        return {
          content: [
            {
              type: "text",
              text: result.recordset[0]?.Definition || "Stored procedure not found",
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
  } finally {
    await sql.close();
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SQL Server MCP Server running on stdio");
}

runServer().catch(console.error);