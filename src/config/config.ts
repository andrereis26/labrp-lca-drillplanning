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
    base: "http://localhost:3000/api",
    routes: {
      upload: "/upload",
    },
  },

  localStorage: {
    modelName: "@LabRP-LCA:model",
  },


};

export default config;