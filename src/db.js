import mongoose from 'mongoose';

export const connnectDB = async () => {

    try {
        await mongoose.connect("mongodb+srv://sisa:1234@cluster0.je0m60t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log('DB is connected');
    } catch (error) {
        console.log(error);
    }
}
