const jwt=require("jsonwebtoken")

const verifyToken=async(req,res,next)=>{
    //extraire d'abord le jeton des entetes
    let token=req.headers["authorization"]

    if(token){
        token=token.split(" ")[1]
        jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
            if(err){
                return res.status(400).json({message:"Invalid token"})
            }
            else{
                console.log(decoded)
                //on stocke la valeur du charge utile que l'on envoyé lors de la génération du jeton dans la requete .user
                req.user=decoded
            }
        })
        next()
    }
    else{
        return res.status(400).json({message:"Invalid token"})      
    }
}

module.exports=verifyToken