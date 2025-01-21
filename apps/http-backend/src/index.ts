import express from "express";
import {createRoomSchema, siginSchema, signupSchema} from "@repo/common/types"
import { middleware } from "./middleware";
import {JWT_SECRET} from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import {prismaClient} from "@repo/db/client";

 
const app = express();

app.use(express.json());

app.post("/signup", async (req,res)=> {
    const { email, password, name } = req.body; 
    const response = signupSchema.safeParse({ email, password, name });
  
    if (!response.success) {
       res.status(404).json({
        msg: "Invalid Inputs",
      });
      return;
    }
    try{
        const user= await prismaClient.user.create({
            data: {
                username : response.data?.email,
                // TODO: Hash the pw
                password: response.data.password,
                name: response.data.name
            }
        }) 
        res.json({
            user:user.id.toString()
          });
         

    }catch(e){
        res.status(411).json({
            msg:"User Already Exists with the username"
        })
    }
   
  });
  

app.post("/signin",async (req,res)=>{
    
    const response= siginSchema.safeParse(req.body);
    const userId=1;
    if(!response.success){
         res.status(404).json({
            msg:"Invlaid Inputs"
        })
    }
   
         
    const user = await prismaClient.user.findFirst({
        where:{
            username:response.data?.email,
            password:response.data?.password
        }
    })
        
   
   if (!user) {
    res.status(403).json({
        message: "Not authorized"
    })
    return;
}

const token = jwt.sign({
    userId: user?.id
}, JWT_SECRET);

res.json({
    token
})
})


app.post("/room",middleware,async (req,res)=>{
    const parseddata = createRoomSchema.safeParse(req.body);

     const userId= req.userId;

     if(!parseddata.success){
        res.json({
            msg:"Invalid Auth"
        })
        return;
     }
     try{
        const room= await prismaClient.room.create({
            data:{
                slug:parseddata.data.name ,
                adminId:userId
            }
          })
            res.json({
                roomId:room.id
            })
     }
     catch(e){
        res.status(411).json({
            msg:"Room Already Exists"
        })
    }
 
})

app.get("/chat/:roomId",async (req,res)=>{
    const roomId= Number(req.params.roomId);
    const messages = await prismaClient.chat.findMany({
        where:{
            roomId:roomId
        },
        orderBy:{
            id:"desc"
        },
        take:50

    })

    res.json({
        messages
    })
})

app.listen(3001);