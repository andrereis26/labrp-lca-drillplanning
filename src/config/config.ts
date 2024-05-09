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
    base: process.env.NODE_ENV === "production" ? "https://" + process.env.VERCEL_URL : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api"),
    routes: {
      upload: "/upload",
      delete: "/delete",
    },
  },

  localStorage: {
    modelName: "@LabRP-LCA:model",
  },


};

export default config;