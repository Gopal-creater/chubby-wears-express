import express,{Express,Request,Response} from 'express';
import morgan from "morgan"

const app:Express = express()

if(process.env.NODE_ENV === "development"){
  app.use(morgan("dev"))
}

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

export default app;