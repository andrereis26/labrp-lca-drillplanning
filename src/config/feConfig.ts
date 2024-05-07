const feConfig = {

    apiRoutes: {
      base: "http://localhost:3000/api",
      routes: {
        upload: "/upload",
      },
    },

    cookies: {
 
    },

    localStorage: {
      
    },
  
    uploads: {
      models: {
        types: ["image/png", "image/jpeg"],
        maxSize: 5 * 1024 * 1024, // 5mb
      },
    },
  };
  
  export default feConfig;