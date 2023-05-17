import { Router } from "express";
import { deleteFile, downloadFile, getFile, login, upload, uploadFile } from "../controller/controller.js";


const route = Router();

route.post('/login',login);
route.post('/upload', upload.single('filename'), uploadFile);
route.get('/get',getFile);
route.get('/download/:idfile', downloadFile);
route.delete('/delete/:idfile',deleteFile);

export default route;