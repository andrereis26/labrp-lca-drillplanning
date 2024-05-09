const config = {
  cookies: {
  },

  uploads: {
    models: {
      type: ["obj"],
    },
    folder: "/models/",
    folderToUpload: "public/models/",
  },

  apiRoutes: {
    base: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/",
    routes: {
      upload: "api/upload",
      delete: "api/delete",
    },
  },

  localStorage: {
    modelUrl: "@LabRP-LCA:model",
  },


};

export default config;