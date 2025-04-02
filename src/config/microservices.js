// Microservice routes configuration
const microservices = {
  clients: {
    url: process.env.CLIENTS_SERVICE_URL || "http://localhost:3001",
    pathRewrite: { "^/api/clients": "/" },
  },
  projects: {
    url: process.env.PROJECTS_SERVICE_URL || "http://localhost:3002",
    pathRewrite: { "^/api/projects": "/" },
  },
  employees: {
    url: process.env.EMPLOYEES_SERVICE_URL || "http://localhost:3003",
    pathRewrite: { "^/api/employees": "/" },
  },
  hiring: {
    url: process.env.HIRING_SERVICE_URL || "http://localhost:3004",
    pathRewrite: { "^/api/hiring": "/" },
  },
};

export default microservices;
