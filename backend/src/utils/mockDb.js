// In-memory database for hackathon demo
let users = [];
let paymentRequests = [];

class MockPrismaClient {
  constructor() {
    this.user = {
      create: async (data) => {
        const user = { id: Date.now().toString(), ...data.data };
        users.push(user);
        return user;
      },
      findUnique: async (query) => {
        return users.find(user => 
          query.where.email ? user.email === query.where.email :
          query.where.id ? user.id === query.where.id : false
        );
      }
    };
    
    this.paymentRequest = {
      create: async (data) => {
        const request = { id: Date.now().toString(), ...data.data };
        paymentRequests.push(request);
        return request;
      },
      findMany: async (query) => {
        return paymentRequests.filter(req => 
          query.where.merchantId ? req.merchantId === query.where.merchantId :
          query.where.userId ? req.userId === query.where.userId : true
        ).map(req => ({
          ...req,
          user: users.find(u => u.id === req.userId),
          merchant: users.find(u => u.id === req.merchantId)
        }));
      },
      findUnique: async (query) => {
        return paymentRequests.find(req => req.id === query.where.id);
      },
      update: async (query) => {
        const index = paymentRequests.findIndex(req => req.id === query.where.id);
        if (index !== -1) {
          paymentRequests[index] = { ...paymentRequests[index], ...query.data };
          return paymentRequests[index];
        }
        return null;
      }
    };
  }
}

module.exports = { PrismaClient: MockPrismaClient };