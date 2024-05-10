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

  pageRoutes:{
    home: "/",
    modelViewer: "/modelViewer/",
  },

  apiRoutes: {
    base: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/",
    routes: {
      upload: "api/upload",
      delete: "api/delete",
      files: "api/files",
    },
  },

  localStorage: {
    modelUrl: "@LabRP-LCA:model",
  },

  firebase: {
    expirationTime: new Date('9999-12-31T23:59:59Z'),
  }

};

export default config;