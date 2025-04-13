import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "MediMatch API Documentation",
    version: "1.0.0",
    description: "API documentation for the MediMatch application",
    contact: {
      name: "MediMatch Team",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          medicalRecordId: {
            type: "string",
            example: "7829a012-c865-4fa8-ac7a-df5d3f1e145b",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          age: {
            type: "number",
            example: 32,
          },
          gender: {
            type: "string",
            enum: ["male", "female", "other"],
            example: "male",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          phone: {
            type: "string",
            example: "1234567890",
          },
          organRequired: {
            type: "string",
            enum: ["kidney", "liver", "heart", "lung", "NA"],
            example: "kidney",
          },
          medicalDetails: {
            type: "object",
            properties: {
              bloodGroup: {
                type: "string",
                example: "O+",
              },
              bloodPressure: {
                type: "string",
                example: "120/80",
              },
              heartAttack: {
                type: "boolean",
                example: false,
              },
              heartValve: {
                type: "boolean",
                example: false,
              },
              heartDefectByBirth: {
                type: "boolean",
                example: false,
              },
              cardiomyopathy: {
                type: "boolean",
                example: false,
              },
            },
          },
          severityScore: {
            type: "number",
            example: 65,
          },
          currentRank: {
            type: "number",
            example: 3,
          },
          isVerified: {
            type: "boolean",
            example: true,
          },
        },
      },
      Doctor: {
        type: "object",
        properties: {
          doctorId: {
            type: "string",
            example: "d4582401-c9a1-48e1-ad5a-4fc763d0b978",
          },
          name: {
            type: "string",
            example: "Dr. Jane Smith",
          },
          email: {
            type: "string",
            format: "email",
            example: "drjane@hospital.com",
          },
          phone: {
            type: "string",
            example: "9876543210",
          },
          department: {
            type: "string",
            example: "Cardiology",
          },
          isVerified: {
            type: "boolean",
            example: true,
          },
        },
      },
      Admin: {
        type: "object",
        properties: {
          adminId: {
            type: "string",
            example: "a1234567-89ab-cdef-0123-456789abcdef",
          },
          name: {
            type: "string",
            example: "Admin User",
          },
          email: {
            type: "string",
            format: "email",
            example: "admin@medimatch.com",
          },
          phone: {
            type: "string",
            example: "5551234567",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Error message details",
          },
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app: Application) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger docs available at /api-docs");
}
