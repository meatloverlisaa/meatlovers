export default {
  datasources: {
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL || 'mysql://meat_lovers_user:StrongLocalPassword@127.0.0.1:3306/meat_lovers_cims',
    },
  },
}
