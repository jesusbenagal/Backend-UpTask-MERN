import mongoose from "mongoose";

const conectarDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const url = `${connection.connection.host}:${connection.connection.port} `;
    console.log(`MongoDB Conectado en: ${url}`);
  } catch (err) {
    console.log(`error: ${err.message}`);
    process.exit(1);
  }
};

export default conectarDB;
