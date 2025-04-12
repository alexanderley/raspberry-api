function isAuthorized(req, res, next) {
    const { payload } = req; // The decoded JWT payload (added by `isAuthenticated`)
    const userIdFromRoute = req.params.userId; // Assuming userId is passed as a route parameter
  
    if (!payload) {
      return res.status(401).json({ message: "Unauthorized: Missing payload" });
    }
  
    // Check if the user ID in the token matches the ID in the route
    if (payload.id !== userIdFromRoute) {
      return res.status(403).json({ message: "Forbidden: You are not authorized to access this resource" });
    }
  
    next(); // If authorized, proceed to the next middleware or route handler
  }