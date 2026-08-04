declare global {
  namespace Express {
    interface Request {
      vendorAuth?: {
        authorized: true;
      };
    }
  }
}

export {};
