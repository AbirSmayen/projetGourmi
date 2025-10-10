const mongoose=require("mongoose") //pour connecter l'application à la base de données

const connectDb=async()=>{
    await mongoose.connect(process.env.CONNECTION_STRING)
    .then(()=>console.log("connected ..."))
}

module.exports=connectDb //exporter la base de données de connexion afin de l'utiliser dans un autre fichier
