const config = {
  uploads: {
    models: {
      type: ["obj"],
    }
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

  firebase: {
    expirationTime: new Date('9999-12-31T23:59:59Z'),
  }

};

export default config;